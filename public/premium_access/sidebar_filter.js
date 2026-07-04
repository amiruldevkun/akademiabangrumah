document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const lessonTitle = document.getElementById('lesson-title');
  const videoPlayer = document.getElementById('video-player');

  // 1. Toggle Sidebar Sliding Mechanics smoothly
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    sidebar.classList.toggle('-translate-x-full');
  });

  // 2. Fetch the new JSON data instead of the old HTML file
  fetch('sidebar-data.json')
    .then(response => response.json())
    .then(data => {
      
      // Initialize the sidebar with the exact search bar styling from your backup
      let sidebarHTML = `
        <div class="mb-6">
          <input
            type="text"
            id="sidebar-search"
            placeholder="Cari topik/video..."
            class="w-full px-3 py-2 text-sm text-black rounded bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 shadow-inner">
        </div>
        <div class="space-y-6">
      `;

      // Loop through each section and map the exact backup classes to the collapsible elements
      data.forEach(section => {
        sidebarHTML += `
          <details class="lesson-section space-y-2 group" close>
            <summary class="lesson-section-title bg-white text-black font-semibold px-3 py-1.5 rounded text-center shadow-sm cursor-pointer list-none select-none outline-none">
              ${section.title}
            </summary>
            <ul class="pl-2 space-y-1 text-sm text-slate-200 mt-2">
        `;
        
        // Loop through each item within the section
        section.items.forEach(item => {
          if (item.video) {
            // Render clickable lesson item with your exact transform & hover styling
            sidebarHTML += `
              <li class="lesson-item cursor-pointer hover:text-white p-1 rounded transform transition-all duration-200 hover:translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm" 
                  data-video="${item.video}" 
                  data-lesson="${item.label}">
                ${item.label}
              </li>
            `;
          } else {
            // Render disabled "Akan Datang" item with your exact slate-400 styling
            sidebarHTML += `
              <li class="lesson-item lesson-item-disabled p-1 rounded text-slate-400 italic cursor-not-allowed select-none" 
                  data-lesson="${item.label}">
                ${item.label} <span class="text-xs">(Akan Datang)</span>
              </li>
            `;
          }
        });

        sidebarHTML += `
            </ul>
          </details>
        `;
      });
      
      sidebarHTML += `</div>`; // Close space-y-6 wrapper

      // Inject the newly constructed HTML directly into the sidebar
      sidebar.innerHTML = sidebarHTML;

      // Add a quick style fix to hide the default summary marker in Safari/Chrome
      const style = document.createElement('style');
      style.innerHTML = `details > summary::-webkit-details-marker { display: none; }`;
      document.head.appendChild(style);

      // 3. Handle Lesson Selection & Auto-Hide Panel
      const lessonItems = sidebar.querySelectorAll('.lesson-item:not(.lesson-item-disabled)');
      
      lessonItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const targetVideo = item.getAttribute('data-video');
          if (!targetVideo) return;

          const targetLesson = item.getAttribute('data-lesson');
          lessonTitle.textContent = targetLesson;
          videoPlayer.src = targetVideo;

          // Highlight the selected item using your exact backup classes (bg-blue-800 text-white)
          lessonItems.forEach(i => i.classList.remove('bg-blue-800', 'text-white'));
          item.classList.add('bg-blue-800', 'text-white');

          // Slide the sidebar back out of frame smoothly after selecting a module
          sidebar.classList.add('-translate-x-full');
        });
      });

      // 4. Search filter — matches lesson item text OR its section title
      const searchInput = document.getElementById('sidebar-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const filterText = e.target.value.toLowerCase();
          const sections = sidebar.querySelectorAll('.lesson-section');

          sections.forEach(section => {
            const titleEl = section.querySelector('.lesson-section-title');
            const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
            const titleMatches = titleText.includes(filterText);

            let anyItemVisible = false;

            section.querySelectorAll('.lesson-item').forEach(item => {
              const itemText = item.textContent.toLowerCase();
              const shouldShow = titleMatches || itemText.includes(filterText);
              item.classList.toggle('hidden', !shouldShow);
              if (shouldShow) {
                anyItemVisible = true;
                section.open = true; // Automatically expand the section if an item inside matches the search
              }
            });

            // Hide the whole section (title + list) if nothing matches
            section.classList.toggle('hidden', !anyItemVisible);
          });
        });

        // Prevent clicking the search bar from accidentally triggering other events
        searchInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    })
    .catch(error => console.error('Error loading sidebar data:', error));

  // 5. Close sidebar if user clicks outside of it on the main content canvas
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuBtn) {
      sidebar.classList.add('-translate-x-full');
    }
  });
});