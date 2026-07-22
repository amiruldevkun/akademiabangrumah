<script lang='ts'>
    let { data }  = $props();
    let name = $state('');
    let phone = $state();

</script>



<div class="border-2 border-dotted flex justify-center items-center">
    <div class="border-solid border-2 flex-col justify-between">
        <h1 class="text-3xl">HELLO WORLD</h1>
        <form name="feedback-form" class="flex flex-col flex-2 gap-3" method="POST" data-netlify>
            <label class="">
                Nama
                <input type="text" bind:value={name} class="w-full rounded-lg border border-[#d1d5dc] px-3 py-2.5 text-sm text-gray-900 mb-5
						       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]" />
            </label>
            <div>
                Email
                <span class="text-sm font-medium text-gray-700 truncate">{data.userEmail}</span>
            </div>
            <label>
                Nombor Telefon
                <input
						id="phone"
						type="tel"
						bind:value={phone}
						required
						placeholder="01X-XXXXXXX"
						autocomplete="tel"
						class="w-full rounded-lg border border-[#d1d5dc] px-3 py-2.5 text-sm text-gray-900 mb-5
						       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]"
					/>
            </label>
        </form>
    </div>
</div>