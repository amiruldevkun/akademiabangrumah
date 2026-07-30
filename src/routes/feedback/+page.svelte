<script lang='ts'>
    let { data }  = $props();
    let name = $state('');
    let phone = $state();
</script>



<div class="flex justify-center items-center p-4">
    <div class=" lg:top-8 rounded-xl transition-all duration-500 p-4 ring-2 ring-[#4a7425] ring-offset-4 ring-offset-gray-50">
        <h1 class="text-3xl mb-3">Hantar feedback anda di sini</h1>
        <form name="feedback-form" class="flex flex-col flex-2 gap-3" method="POST">
            <label class="">
                Nama
                <input type="text" required bind:value={name} class="w-full rounded-lg border border-[#d1d5dc] px-3 py-2.5 text-sm text-gray-900
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

            <label class="flex flex-col gap-3">
                Letakkan cadangan anda bagi penambahbaikan platform ini!
                <textarea class="w-full rounded-lg border border-[#d1d5dc] px-3 py-2.5 text-sm text-gray-900 mb-5
						       focus:outline-none focus:ring-2 focus:ring-[#4a7425] focus:border-[#4a7425]"></textarea>
            </label>

            <input type="submit" value="Submit" class="border-2 border-[#d1d5dc] rounded-lg hover:outline-none hover:ring-2 hover:ring-[#4a7425] hover:border-[#4a7425]"/>
        </form>
    </div>
</div>