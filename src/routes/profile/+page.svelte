<script lang="ts">
  import { enhance } from "$app/forms";
  import { supabase } from "$lib/supabaseClient";
  import type { PageData, ActionData } from "./$types";
  import { onMount } from "svelte";
  import type { UserIdentity } from "@supabase/supabase-js";
  import { capturePostHog } from "$lib/posthogClient";
  // import { linkUserIdentViaGoogle } from "$lib/identLink";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let identities = $state<UserIdentity[]>([]);
  let googleError = $state<string | null>(null);

  let googleIdentity = $derived(
    identities.find((identity) => identity.provider === "google"),
  );
  let hasGoogleLinked = $derived(!!googleIdentity);
  let canUnlink = $derived(identities.length > 1);

  let submitting = $state(false);
  let linkingGoogle = $state(false);

  let sendingReset = $state(false);
  let resetEmailSent = $state(false);
  let resetError = $state<string | null>(null);

  function goBack(e: MouseEvent) {
    e.preventDefault();
    window.history.back();
  }

  async function refreshIdentities() {
    const { data: identData, error } = await supabase.auth.getUserIdentities();
    if (error) {
      googleError = error.message;
      return;
    }
    identities = identData.identities;
  }

  onMount(() => {
    window.scrollTo(0, 0);
    refreshIdentities();
  });

  // Dynamic Initials for DaisyUI Avatar Placeholder
  let initials = $derived(
    (form?.full_name ?? data.profile?.full_name)
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "AU",
  );

  // User Status Badge (if is_admin true or nah)
  let userStatus = $derived(data.profile?.is_admin ? "Admin" : "Pelajar");

  async function linkGoogleAccount() {
    linkingGoogle = true;
    googleError = null;
    const { error } = await supabase.auth.linkIdentity({ provider: "google" });
    // On success the browser auto-redirects to Google's consent screen.
    // We only get here (without navigating away) if it failed.
    if (error) googleError = error.message;
    linkingGoogle = false;
  }

  async function unlinkGoogleAccount() {
    if (!googleIdentity || !canUnlink) return;
    linkingGoogle = true;
    googleError = null;
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) googleError = error.message;
    await refreshIdentities();
    linkingGoogle = false;
  }

  async function sendPasswordReset() {
    sendingReset = true;
    resetError = null;
    resetEmailSent = false;

    // Fetch the live auth email rather than trusting profiles.email, since
    // the contact email in the profiles table can diverge from the login email.
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.email) {
      resetError = "Tidak dapat mengesan emel log masuk akaun ini.";
      sendingReset = false;
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      userData.user.email,
      { redirectTo: `${window.location.origin}/auth/reset_password` },
    );

    sendingReset = false;

    if (error) {
      resetError = error.message;
      return;
    }

    resetEmailSent = true;
    capturePostHog("password_reset_requested");
  }
</script>

<svelte:head>
  <title>Profil Saya | Akademi Abang Rumah</title>
</svelte:head>

<div class="min-h-dvh bg-[#FAF9F5] pb-16 pt-6">
  <div class="mx-auto max-w-2xl px-4 sm:px-6">
    <!-- Top Action Navigation -->
    <div class="mb-6 flex items-center justify-between">
      <button
        type="button"
        onclick={goBack}
        class="btn btn-outline btn-sm gap-2 rounded-2xl border-gray-200 text-gray-700 hover:border-[#4a7425]/40 hover:bg-transparent"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Kembali
      </button>
    </div>

    <!-- Main Profile Card -->
    <div
      class="card bg-white shadow-none border border-gray-200 rounded-3xl overflow-hidden"
    >
      <!-- Decorative Banner Header -->
      <div class="h-28 bg-[#4a7425]"></div>

      <div class="card-body pt-0">
        <!-- Identity Header Section -->
        <div
          class="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 mb-6 gap-4"
        >
          <div class="avatar placeholder relative">
            <div
              class="bg-neutral text-neutral-content w-24 rounded-2xl ring-4 ring-white shadow-md"
            >
              <img src={data.profile?.avatar_url} alt="User Avatar" />
              {#if !data.profile?.avatar_url}
                <span class="text-3xl">{initials}</span>
              {/if}
            </div>
          </div>

          <div class="space-y-1 flex-col">
            <div class="flex items-center gap-2 lg:pt-10">
              <h1 class="card-title text-2xl font-bold pt-4">
                {form?.full_name ?? data.profile?.full_name ?? "Pengguna"}
              </h1>
              <div
                class="badge badge-outline text-xs font-semibold border-[#4a7425]/40 text-[#4a7425]"
              >
                {userStatus}
              </div>
            </div>
            <p class="text-xs text-base-content/70 pt-1">
              User ID: <span class="font-mono">{data.profile?.id}</span>
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-500 opacity-80">
          Gambar profil mengikut akaun Google
        </p>

        <!-- daisyUI Alert Notifications -->
        {#if form?.error}
          <div
            role="alert"
            class="alert alert-error alert-soft rounded-2xl mb-6 mt-4"
          >
            <svg
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{form.error}</span>
          </div>
        {/if}

        {#if form?.success}
          <div
            role="alert"
            class="alert alert-success alert-soft rounded-2xl mb-6 mt-4"
          >
            <svg
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Profil berjaya dikemaskini!</span>
          </div>
        {/if}

        <!-- Edit Profile Form -->
        <form
          method="POST"
          action="?/updateProfile"
          use:enhance={() => {
            submitting = true;
            return async ({ update, result }) => {
              submitting = false;
              if (result.type === "success") {
                capturePostHog("profile_updated");
              }
              await update({ reset: false });
            };
          }}
          class="space-y-6 mt-6"
        >
          <!-- Section 1: Maklumat Peribadi -->
          <div class="space-y-4">
            <h2
              class="text-sm font-bold uppercase tracking-wider text-base-content/60"
            >
              Maklumat Peribadi
            </h2>

            <!-- Full Name Field -->
            <div class="form-control w-full">
              <label
                for="full_name"
                class="label flex flex-col items-start gap-0"
              >
                <span class="label-text font-semibold">Nama Penuh</span>
                <span class="label-text text-xs pb-2"
                  >Tak perlu tukar jika mahu tukar email sahaja</span
                >
              </label>

              <label
                class="input input-bordered rounded-2xl border-gray-200 focus-within:border-[#4a7425] flex items-center gap-3"
              >
                <svg
                  class="h-5 w-5 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form?.full_name ?? data.profile?.full_name}
                  required
                  placeholder="Contoh: Ali bin Ahmad"
                  class="grow"
                />
              </label>
            </div>
          </div>

          <div class="divider my-2"></div>

          <!-- Section 2: Butiran Hubungan Terpengesah -->
          <div class="space-y-4">
            <h2
              class="text-sm font-bold uppercase tracking-wider text-base-content/60"
            >
              Maklumat Hubungan
            </h2>

            <!-- Verified Personal Email Field -->
            <div class="form-control w-full">
              <label for="email" class="label flex flex-wrap items-start pb-2">
                <span class="label-text font-semibold">Emel Peribadi</span>
                <span class="badge badge-success badge-sm">Disahkan</span>
                <span class="text-xs">
                  Tak perlu tukar jika hanya menukar nama panggilan
                </span>
              </label>

              <label
                class="input input-bordered rounded-2xl border-gray-200 focus-within:border-[#4a7425] flex items-center gap-3"
              >
                <svg
                  class="h-5 w-5 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form?.email ?? data.profile?.email}
                  placeholder="studentabangrumah@gmail.com"
                  class="grow"
                />
              </label>
            </div>

            <!-- Phone Number Input Skeleton -->
            <!-- <div class="form-control w-full">
              <label for="phone" class="label justify-between">
                <span class="label-text font-semibold">Nombor Telefon</span>
                <span class="badge badge-warning badge-sm">Sila Kemaskini</span>
              </label>
              <label class="input input-bordered flex items-center gap-3">
                <svg
                  class="h-5 w-5 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.826-1.07-5.023-3.267-6.093-6.093l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
                  />
                </svg>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+60123456789"
                  class="grow"
                />
              </label>
            </div> -->

            <!-- Read-Only Login Email Field -->
            <!-- <div
              class="card bg-base-200 border border-base-300 p-4 rounded-xl mt-3"
            >
              <label for="login_email" class="label p-0 pb-2">
                <span
                  class="label-text-alt uppercase font-bold text-base-content/60"
                  >Emel Log Masuk (Akaun Utama)</span
                >
              </label>
              <label
                class="input input-bordered flex items-center gap-3 input-disabled"
              >
                <input
                  id="login_email"
                  type="email"
                  value={data.profile?.email}
                  disabled
                  class="grow cursor-not-allowed"
                />
                <svg
                  class="h-4 w-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"
                  />
                </svg>
                <button class="btn bg-[#4a7425]"> Tukar Email </button></label
              >
            </div> -->
          </div>

          <div class="divider my-2"></div>

          <!-- Section 3: Integrasi Akaun Sosial / Google OAuth -->
          <div class="space-y-4">
            <h2
              class="text-sm font-bold uppercase tracking-wider text-base-content/60"
            >
              Integrasi Akaun
            </h2>

            <div
              class="card bg-gray-50 border border-gray-200 p-4 rounded-2xl flex sm:flex-row items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-white border border-gray-200">
                  <svg class="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-sm">Google Account</p>
                  <p class="text-xs text-base-content/60">
                    Gunakan akaun Google untuk log masuk dengan pantas.
                  </p>
                </div>
              </div>
              {#if !hasGoogleLinked}
                <button
                  type="button"
                  onclick={linkGoogleAccount}
                  disabled={linkingGoogle}
                  class="btn btn-outline btn-sm sm:w-auto w-full rounded-2xl border-gray-300 text-gray-700 hover:border-[#4a7425]/40 hover:bg-transparent"
                >
                  {#if linkingGoogle}
                    <span class="loading loading-spinner loading-xs"></span>
                  {:else}
                    Sambungkan
                  {/if}
                </button>
              {:else if canUnlink}
                <button
                  type="button"
                  onclick={unlinkGoogleAccount}
                  disabled={linkingGoogle}
                  class="btn btn-outline btn-error btn-sm sm:w-auto w-full rounded-2xl"
                >
                  {#if linkingGoogle}
                    <span class="loading loading-spinner loading-xs"></span>
                  {:else}
                    Putuskan
                  {/if}
                </button>
              {:else}
                <div class="badge badge-success badge-soft gap-1.5 p-3">
                  Bersambung (kaedah log masuk utama)
                </div>
              {/if}
            </div>
            {#if googleError}
              <p class="text-xs text-error">{googleError}</p>
            {/if}
          </div>

          <div class="divider my-2"></div>

          <!-- Section 4: Keselamatan / Tetapan Semula Kata Laluan -->
          <div class="space-y-4">
            <h2
              class="text-sm font-bold uppercase tracking-wider text-base-content/60"
            >
              Keselamatan
            </h2>

            {#if resetError}
              <div
                role="alert"
                class="alert alert-error alert-soft rounded-2xl"
              >
                <span class="text-sm">{resetError}</span>
              </div>
            {/if}

            {#if resetEmailSent}
              <div
                role="alert"
                class="alert alert-success alert-soft rounded-2xl"
              >
                <span class="text-sm"
                  >Link tetapan semula kata laluan telah dihantar ke emel log
                  masuk anda. Sila semak peti 'Inbox' anda.</span
                >
              </div>
            {/if}

            <div
              class="card bg-gray-50 border border-gray-200 p-4 rounded-2xl flex sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <p class="font-semibold text-sm">Kata Laluan</p>
                <p class="text-xs text-base-content/60">
                  Kami akan menghantar pautan ke emel log masuk anda untuk
                  menetapkan semula kata laluan.
                </p>
              </div>
              <button
                type="button"
                onclick={sendPasswordReset}
                disabled={sendingReset}
                class="btn btn-outline btn-sm sm:w-auto w-full rounded-2xl border-gray-300 text-gray-700 hover:border-[#4a7425]/40 hover:bg-transparent"
              >
                {#if sendingReset}
                  <span class="loading loading-spinner loading-xs"></span>
                {:else}
                  Hantar Emel Tetapan Semula
                {/if}
              </button>
            </div>
          </div>

          <!-- Submit Action Button -->
          <div class="pt-4">
            <button
              type="submit"
              disabled={submitting}
              class="btn bg-[#4a7425] hover:bg-[#3d5f1f] border-none text-white w-full rounded-2xl"
            >
              {#if submitting}
                <span class="loading loading-spinner loading-sm"></span>
                <span>Menyimpan...</span>
              {:else}
                <span>Simpan Perubahan</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
