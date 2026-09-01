<script lang="ts">
  import { enhance } from "$app/forms";
  import { navigating } from "$app/state";
  import type { ActionData, PageData } from "./$types";
  import { capturePostHog } from "$lib/posthogClient";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let activeId = $state<string | null>(null);
  let isSearching = $state(false);

  $effect(() => {
    if (!navigating.to) {
      isSearching = false;
    }
  });

  const statusStyles: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
  };

  function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatAmount(amount: number, currency: string) {
    return `${currency} ${amount.toFixed(2)}`;
  }

  const filters = [
    { label: "All Orders", value: null },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];
</script>

<svelte:head>
  <title>Admin Overview</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto p-4">
  <!-- Search Input -->
  <form method="GET" class="flex gap-2" onsubmit={() => (isSearching = true)}>
    {#if data.statusFilter}
      <input type="hidden" name="status" value={data.statusFilter} />
    {/if}
    <input
      type="text"
      name="q"
      value={data.search}
      placeholder="Search email, bill code, or ref no..."
      class="flex-1 rounded border border-gray-300 p-2 text-sm"
    />
    <button
      type="submit"
      class="rounded bg-gray-800 px-4 py-2 text-white text-sm font-medium cursor-pointer"
    >
      {#if isSearching === true}
        <span class="loading loading-spinner loading-md"></span>
        Loading...
      {:else}
        Search
      {/if}
    </button>
    {#if data.search || data.statusFilter}
      <!--eslint-disable svelte/no-navigation-without-resolve -->
      <a
        href="?"
        class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center"
      >
        Clear
      </a>
    {/if}
  </form>

  {#if form?.message}
    <p class="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
      {form.message}
    </p>
  {/if}

  <!-- RESULTS SECTION -->
  {#if !data.search && !data.statusFilter}
    <div
      class="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"
    >
      <p class="text-gray-500 text-sm">
        Enter an email or reference code above to search profiles & orders.
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <!-- PROFILES COLUMN -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          Profiles <span class="text-xs font-normal text-gray-500"
            >({data.profiles.length})</span
          >
        </h2>

        {#if data.profiles.length === 0}
          <div
            class="rounded border border-gray-200 p-4 text-sm text-gray-500 bg-gray-50"
          >
            No profiles match "{data.search}".
          </div>
        {:else}
          <div class="space-y-3">
            {#each data.profiles as profile (profile.id)}
              <div
                class="rounded border border-gray-200 p-4 space-y-3 bg-white shadow-sm"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="font-medium text-gray-900">
                      {profile.full_name ?? "No name"}
                    </p>
                    <p class="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <div class="flex gap-1 shrink-0">
                    {#if profile.is_admin}
                      <span
                        class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800"
                        >ADMIN</span
                      >
                    {/if}
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-semibold {profile.has_paid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'}"
                    >
                      {profile.has_paid ? "PAID" : "UNPAID"}
                    </span>
                  </div>
                </div>

                <p class="text-[11px] text-gray-400">
                  Joined {formatDate(profile.created_at)}
                  {#if profile.paid_at}· Paid {formatDate(profile.paid_at)}{/if}
                </p>

                <!-- Actions -->
                <div class="flex gap-2 pt-1 border-t border-gray-100">
                  <form
                    method="POST"
                    action="?/toggleHasPaid"
                    use:enhance={() => {
                      activeId = profile.id;
                      return async ({ update, result }) => {
                        if (result.type === "success") {
                          capturePostHog("user_access_updated", {
                            access_granted: !profile.has_paid,
                          });
                        }
                        await update();
                        activeId = null;
                      };
                    }}
                  >
                    <input type="hidden" name="id" value={profile.id} />
                    <button
                      type="submit"
                      disabled={activeId === profile.id}
                      class="rounded border border-gray-300 px-2.5 py-1 text-xs disabled:opacity-50 hover:bg-gray-50"
                    >
                      {profile.has_paid ? "Revoke Access" : "Grant Access"}
                    </button>
                  </form>

                  {#if profile.id !== data.currentUserId}
                    <form
                      method="POST"
                      action="?/toggleAdmin"
                      use:enhance={() => {
                        activeId = profile.id;
                        return async ({ update, result }) => {
                          if (result.type === "success") {
                            capturePostHog("user_admin_role_updated", {
                              admin_granted: !profile.is_admin,
                            });
                          }
                          await update();
                          activeId = null;
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={profile.id} />
                      <button
                        type="submit"
                        disabled={activeId === profile.id}
                        class="rounded border border-gray-300 px-2.5 py-1 text-xs disabled:opacity-50 hover:bg-gray-50"
                      >
                        {profile.is_admin ? "Demote" : "Make Admin"}
                      </button>
                    </form>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- ORDERS COLUMN -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            Orders <span class="text-xs font-normal text-gray-500"
              >({data.orders.length})</span
            >
          </h2>
          <!-- Order Filters -->
          <div class="flex gap-1">
            {#each filters as f (f)}
              <a
                href={f.value
                  ? `?status=${f.value}${data.search ? `&q=${data.search}` : ""}`
                  : data.search
                    ? `?q=${data.search}`
                    : "?"}
                class="px-2 py-0.5 text-xs rounded transition
                  {data.statusFilter === f.value ||
                (!data.statusFilter && !f.value)
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-100'}"
              >
                {f.label}
              </a>
            {/each}
          </div>
        </div>

        {#if data.orders.length === 0}
          <div
            class="rounded border border-gray-200 p-4 text-sm text-gray-500 bg-gray-50"
          >
            No orders found.
          </div>
        {:else}
          <div class="space-y-3">
            {#each data.orders as order (order.id)}
              <div
                class="rounded border border-gray-200 p-4 space-y-2 bg-white shadow-sm"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="font-medium text-gray-900 text-sm">
                      {order.customer_name}
                    </p>
                    <p class="text-xs text-gray-500">{order.customer_email}</p>
                  </div>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase {statusStyles[
                      order.status
                    ] ?? 'bg-gray-100 text-gray-800'}"
                  >
                    {order.status}
                  </span>
                </div>

                <div
                  class="flex items-center justify-between text-xs text-gray-700 bg-gray-50 p-2 rounded"
                >
                  <span>{order.product_name}</span>
                  <span class="font-bold"
                    >{formatAmount(order.amount, order.currency)}</span
                  >
                </div>

                {#if order.toyyibpay_bill_code || order.toyyibpay_ref_no}
                  <div class="text-[11px] text-gray-400 font-mono">
                    {#if order.toyyibpay_bill_code}bill: {order.toyyibpay_bill_code}{/if}
                    {#if order.toyyibpay_ref_no}&nbsp;· ref: {order.toyyibpay_ref_no}{/if}
                  </div>
                {/if}

                <form
                  method="POST"
                  action="?/updateStatus"
                  use:enhance={() => {
                    activeId = order.id;
                    return async ({ update, result }) => {
                      if (result.type === "success") {
                        capturePostHog("order_status_updated");
                      }
                      await update();
                      activeId = null;
                    };
                  }}
                  class="flex items-center justify-between pt-1 border-t border-gray-100"
                >
                  <input type="hidden" name="id" value={order.id} />
                  <span class="text-[11px] text-gray-400"
                    >{formatDate(order.created_at)}</span
                  >

                  <div class="flex gap-2">
                    <select
                      name="status"
                      class="rounded border border-gray-300 text-xs p-1"
                      disabled={activeId === order.id}
                    >
                      <option value="paid" selected={order.status === "paid"}
                        >paid</option
                      >
                      <option
                        value="pending"
                        selected={order.status === "pending"}>pending</option
                      >
                      <option
                        value="failed"
                        selected={order.status === "failed"}>failed</option
                      >
                    </select>
                    <button
                      type="submit"
                      disabled={activeId === order.id}
                      class="rounded bg-gray-800 px-2.5 py-1 text-white text-xs disabled:opacity-50"
                    >
                      {activeId === order.id ? "Saving…" : "Update"}
                    </button>
                  </div>
                </form>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
