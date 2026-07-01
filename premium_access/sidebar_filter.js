document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const lessonTitle = document.getElementById('lesson-title');
  const videoPlayer = document.getElementById('video-player');

  // 1. Toggle Sidebar Sliding Mechanics smoothly
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents instant closing triggers
    sidebar.classList.toggle('-translate-x-full');
  });

  // Fetch sidebar, THEN wire up everything that depends on its contents
  fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
      sidebar.innerHTML = data;

      // Query these AFTER the sidebar HTML is actually in the DOM
      const lessonItems = sidebar.querySelectorAll('.lesson-item');

      // 2. Handle Lesson Selection & Auto-Hide Panel
      lessonItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const targetVideo = item.getAttribute('data-video');

          // "Akan Datang" (coming soon) items have no data-video — ignore clicks on them
          if (!targetVideo) return;

          const targetLesson = item.getAttribute('data-lesson');

          lessonTitle.textContent = targetLesson;
          videoPlayer.src = targetVideo;

          lessonItems.forEach(i => i.classList.remove('bg-blue-800', 'text-white'));
          item.classList.add('bg-blue-800', 'text-white');

          // Slide the sidebar back out of frame smoothly after selecting a module
          sidebar.classList.add('-translate-x-full');
        });
      });

      // 3. Search filter — matches lesson item text OR its section title
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
              }
            });

            // hide the whole section (title + list) if nothing matches
            section.classList.toggle('hidden', !anyItemVisible);
          });
        });

        searchInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    })
    .catch(error => console.error('Error loading sidebar:', error));

  // 4. Close sidebar if user clicks outside of it on the main content canvas
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && e.target !== menuBtn) {
      sidebar.classList.add('-translate-x-full');
    }
  });
});
