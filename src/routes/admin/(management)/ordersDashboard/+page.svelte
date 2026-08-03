<!-- src/routes/admin/(management)/ordersDashboard/+page.svelte -->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let updatingId = $state<string | null>(null);

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
    { label: "All", value: null },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];
</script>

<svelte:head>
  <title>Orders Dashboard - Admin AAR</title>
</svelte:head>

<div class="space-y-4">
  <!-- Search by bill code or ToyyibPay ref no (shown on customer receipt) -->
  <form method="GET" class="flex gap-2">
    {#if data.statusFilter}
      <input type="hidden" name="status" value={data.statusFilter} />
    {/if}
    <input
      type="text"
      name="q"
      value={data.search}
      placeholder="Search bill code or ref no..."
      class="flex-1 rounded border border-gray-300 p-2 text-sm font-mono"
    />
    <button
      type="submit"
      class="rounded bg-gray-800 px-4 py-2 text-white text-sm"
    >
      Search
    </button>
    {#if data.search}
      <a
        href={data.statusFilter ? `?status=${data.statusFilter}` : "?"}
        class="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Clear
      </a>
    {/if}
  </form>

  <!-- Status filter tabs -->
  <div class="flex gap-2 border-b border-gray-200 pb-3">
    {#each filters as f}
      <a
        href={f.value
          ? `?status=${f.value}${data.search ? `&q=${data.search}` : ""}`
          : data.search
            ? `?q=${data.search}`
            : "?"}
        class="px-3 py-1.5 rounded-md text-sm font-medium transition
					{data.statusFilter === f.value || (!data.statusFilter && !f.value)
          ? 'bg-gray-800 text-white'
          : 'text-gray-600 hover:bg-gray-100'}"
      >
        {f.label}
      </a>
    {/each}
  </div>

  {#if form?.message}
    <p class="text-sm text-red-600">{form.message}</p>
  {/if}

  <div class="space-y-3">
    {#each data.orders as order (order.id)}
      <div class="rounded border border-gray-200 p-4 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium text-gray-900">{order.customer_name}</p>
            <p class="text-sm text-gray-500">{order.customer_email}</p>
            {#if order.customer_phone}
              <p class="text-sm text-gray-500">{order.customer_phone}</p>
            {/if}
          </div>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyles[
              order.status
            ] ?? 'bg-gray-100 text-gray-800'}"
          >
            {order.status}
          </span>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-700">
          <span>{order.product_name}</span>
          <span class="font-medium"
            >{formatAmount(order.amount, order.currency)}</span
          >
          <span class="text-gray-400"
            >Ordered {formatDate(order.created_at)}</span
          >
          {#if order.paid_at}
            <span class="text-gray-400">Paid {formatDate(order.paid_at)}</span>
          {/if}
        </div>

        {#if order.toyyibpay_bill_code || order.toyyibpay_ref_no}
          <div class="text-xs text-gray-400 font-mono">
            {#if order.toyyibpay_bill_code}bill: {order.toyyibpay_bill_code}{/if}
            {#if order.toyyibpay_ref_no}&nbsp;· ref: {order.toyyibpay_ref_no}{/if}
          </div>
        {/if}

        <form
          method="POST"
          action="?/updateStatus"
          use:enhance={() => {
            updatingId = order.id;
            return async ({ update }) => {
              await update();
              updatingId = null;
            };
          }}
          class="flex items-center gap-2 pt-2"
        >
          <input type="hidden" name="id" value={order.id} />
          <select
            name="status"
            class="rounded border border-gray-300 text-sm p-1.5"
            disabled={updatingId === order.id}
          >
            <option value="paid" selected={order.status === "paid"}>paid</option
            >
            <option value="pending" selected={order.status === "pending"}
              >pending</option
            >
            <option value="failed" selected={order.status === "failed"}
              >failed</option
            >
          </select>
          <button
            type="submit"
            disabled={updatingId === order.id}
            class="rounded bg-gray-800 px-3 py-1.5 text-white text-sm disabled:opacity-50"
          >
            {updatingId === order.id ? "Saving…" : "Update"}
          </button>
        </form>
      </div>
    {:else}
      <p class="text-sm text-gray-500 text-center py-8">No orders found.</p>
    {/each}
  </div>
</div>
