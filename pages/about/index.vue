<template>
  <div class="pt-8 items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
    <div class="flex flex-col items-center text-center text-gray-600 dark:text-gray-300">
      <div>
        <img alt="Nguyen Quoc Dai - Backend Software Engineer Profile Photo"
             class="w-48 h-48 rounded-full hover:scale-105"
             src="/profile.jpg"
             @error="handleProfileImageError">
      </div>
      <h3 class="pt-4 pb-2 text-3xl font-bold leading-8 tracking-tight">Nguyen Quoc Dai</h3>
      <div class="font-bold p-1">Backend Software Engineer</div>
      <div class="text-justify">
        <p class="mb-3">Passionate about architecting robust, scalable systems and delivering innovative solutions that
          solve complex technical challenges with measurable business impact</p>
        <p class="text-sm font-medium bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <b>Professional Summary:</b> Experienced Backend Software Engineer with 6+ years developing high-performance
          web applications for media and e-commerce industries.
          Expert in PHP, Python, and modern frameworks with proven expertise in system architecture, database
          optimization,
          and seamless third-party integrations. Proven track record of building scalable solutions that serve millions
          of users.
        </p>
      </div>
      <div class="w-full text-left p-2 mt-3 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </span>
          <span class="tracking-wide">Social</span>
        </div>
        <div class="flex justify-center pl-2 pt-3 space-x-3 text-sm">
          <a target="_blank" rel="noopener noreferrer" href="mailto:quocdaijr@gmail.com">
            <span class="sr-only">Mail</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z" />
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://t.me/quocdaijr">
            <span class="sr-only">Telegram</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer"
            href="https://signal.me/#eu/U1eIvUn29-2TB8fu6lTq-nxX0qOa3LNUCoyywDx_WVvEdYF7C5NK15eKfieS3TDe">
            <span class="sr-only">Signal</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M 25 2 L 24.78125 2.0019531 L 24.796875 4.0019531 L 25 4 C 26.529 4 28.054203 4.1651875 29.533203 4.4921875 L 29.966797 2.5390625 C 28.345797 2.1810625 26.674 2 25 2 z M 22.695312 2.1132812 C 20.955313 2.2872813 19.241656 2.6606562 17.597656 3.2226562 L 18.242188 5.1152344 C 19.741187 4.6022344 21.307531 4.2625156 22.894531 4.1035156 L 22.695312 2.1132812 z M 31.984375 3.0859375 L 31.376953 4.9902344 C 32.893953 5.4762344 34.349078 6.1370312 35.705078 6.9570312 L 36.740234 5.2460938 C 35.250234 4.3450938 33.649375 3.6189375 31.984375 3.0859375 z M 15.648438 3.9921875 C 14.051438 4.7111875 12.545875 5.6147344 11.171875 6.6777344 L 12.394531 8.2597656 C 13.645531 7.2917656 15.015703 6.4694531 16.470703 5.8144531 L 15.648438 3.9921875 z M 38.476562 6.4121094 L 37.285156 8.0195312 C 38.566156 8.9705312 39.727422 10.068203 40.732422 11.283203 L 42.273438 10.009766 C 41.165437 8.6707656 39.887563 7.4591094 38.476562 6.4121094 z M 25 7 C 15.626 7 8 14.178 8 23 C 8 28.129 10.606 32.9265 15 35.9375 L 15 41 C 15 41.357 15.19 41.686234 15.5 41.865234 C 15.654 41.954234 15.827 42 16 42 C 16.172 42 16.344047 41.955234 16.498047 41.865234 L 21.929688 38.738281 C 22.939688 38.912281 23.972 39 25 39 C 34.374 39 42 31.822 42 23 C 42 14.178 34.374 7 25 7 z M 9.578125 8.0371094 C 8.295125 9.2421094 7.1675156 10.594641 6.2285156 12.056641 L 7.9121094 13.136719 C 8.7631094 11.811719 9.7842656 10.586141 10.947266 9.4941406 L 9.578125 8.0371094 z M 43.529297 11.689453 L 41.869141 12.804688 C 42.757141 14.125688 43.469281 15.54825 43.988281 17.03125 L 45.878906 16.371094 C 45.302906 14.727094 44.511297 13.152453 43.529297 11.689453 z M 5.1855469 13.878906 C 4.3875469 15.450906 3.8005 17.113266 3.4375 18.822266 L 5.3945312 19.238281 C 5.7205312 17.698281 6.24975 16.200203 6.96875 14.783203 L 5.1855469 13.878906 z M 46.466797 18.392578 L 44.519531 18.849609 C 44.838531 20.202609 45 21.6 45 23 C 45 23.184 44.996234 23.366828 44.990234 23.548828 L 46.990234 23.609375 C 46.996234 23.407375 47 23.204 47 23 C 47 21.445 46.819797 19.895578 46.466797 18.392578 z M 3.109375 20.900391 C 3.037375 21.595391 3 22.301 3 23 C 3 24.052 3.0820938 25.109578 3.2460938 26.142578 L 5.2226562 25.830078 C 5.0756563 24.899078 5 23.948 5 23 C 5 22.37 5.0336563 21.733422 5.0976562 21.107422 L 3.109375 20.900391 z M 44.835938 25.4375 C 44.624937 27.0005 44.207703 28.533141 43.595703 29.994141 L 45.441406 30.767578 C 46.120406 29.144578 46.585359 27.441078 46.818359 25.705078 L 44.835938 25.4375 z M 5.6152344 27.683594 L 3.6835938 28.199219 C 4.1335938 29.887219 4.8047344 31.519828 5.6777344 33.048828 L 7.4140625 32.056641 C 6.6270625 30.676641 6.0222344 29.205594 5.6152344 27.683594 z M 42.775391 31.703125 C 42.023391 33.083125 41.092859 34.377828 40.005859 35.548828 L 41.472656 36.908203 C 42.671656 35.615203 43.69925 34.185156 44.53125 32.660156 L 42.775391 31.703125 z M 8.4375 33.65625 L 6.8105469 34.818359 C 7.7425469 36.125359 8.830875 37.330297 10.046875 38.404297 L 10.457031 42.427734 L 12.449219 42.224609 L 11.996094 37.806641 C 11.969094 37.549641 11.844437 37.313484 11.648438 37.146484 C 10.433437 36.113484 9.3535 34.93925 8.4375 33.65625 z M 38.646484 36.876953 C 37.466484 37.924953 36.153094 38.837891 34.746094 39.587891 L 35.6875 41.351562 C 37.2325 40.527563 38.675609 39.524094 39.974609 38.371094 L 38.646484 36.876953 z M 33.023438 40.402344 C 31.562437 41.012344 30.023172 41.454797 28.451172 41.716797 L 28.779297 43.689453 C 30.504297 43.402453 32.191922 42.917047 33.794922 42.248047 L 33.023438 40.402344 z M 22.847656 41.890625 C 22.680656 41.874625 22.499844 41.900703 22.339844 41.970703 L 21.326172 42.419922 L 22.138672 44.248047 L 22.910156 43.904297 C 24.179156 44.019297 25.464078 44.0285 26.705078 43.9375 L 26.558594 41.943359 C 25.341594 42.031359 24.083656 42.015625 22.847656 41.890625 z M 19.5 43.232422 L 14.927734 45.259766 L 15.738281 47.087891 L 20.310547 45.060547 L 19.5 43.232422 z M 12.652344 44.212891 L 10.662109 44.417969 L 11.005859 47.753906 C 11.038859 48.072906 11.222047 48.354625 11.498047 48.515625 C 11.653047 48.605625 11.826 48.650391 12 48.650391 C 12.138 48.650391 12.275297 48.623453 12.404297 48.564453 L 13.910156 47.896484 L 13.099609 46.068359 L 12.853516 46.177734 L 12.652344 44.212891 z">
              </path>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://discord.com/users/quocdaijr">
            <span class="sr-only">Discord</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 50 50"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M 41.625 10.769531 C 37.644531 7.566406 31.347656 7.023438 31.078125 7.003906 C 30.660156 6.96875 30.261719 7.203125 30.089844 7.589844 C 30.074219 7.613281 29.9375 7.929688 29.785156 8.421875 C 32.417969 8.867188 35.652344 9.761719 38.578125 11.578125 C 39.046875 11.867188 39.191406 12.484375 38.902344 12.953125 C 38.710938 13.261719 38.386719 13.429688 38.050781 13.429688 C 37.871094 13.429688 37.6875 13.378906 37.523438 13.277344 C 32.492188 10.15625 26.210938 10 25 10 C 23.789063 10 17.503906 10.15625 12.476563 13.277344 C 12.007813 13.570313 11.390625 13.425781 11.101563 12.957031 C 10.808594 12.484375 10.953125 11.871094 11.421875 11.578125 C 14.347656 9.765625 17.582031 8.867188 20.214844 8.425781 C 20.0625 7.929688 19.925781 7.617188 19.914063 7.589844 C 19.738281 7.203125 19.34375 6.960938 18.921875 7.003906 C 18.652344 7.023438 12.355469 7.566406 8.320313 10.8125 C 6.214844 12.761719 2 24.152344 2 34 C 2 34.175781 2.046875 34.34375 2.132813 34.496094 C 5.039063 39.605469 12.972656 40.941406 14.78125 41 C 14.789063 41 14.800781 41 14.8125 41 C 15.132813 41 15.433594 40.847656 15.621094 40.589844 L 17.449219 38.074219 C 12.515625 36.800781 9.996094 34.636719 9.851563 34.507813 C 9.4375 34.144531 9.398438 33.511719 9.765625 33.097656 C 10.128906 32.683594 10.761719 32.644531 11.175781 33.007813 C 11.234375 33.0625 15.875 37 25 37 C 34.140625 37 38.78125 33.046875 38.828125 33.007813 C 39.242188 32.648438 39.871094 32.683594 40.238281 33.101563 C 40.601563 33.515625 40.5625 34.144531 40.148438 34.507813 C 40.003906 34.636719 37.484375 36.800781 32.550781 38.074219 L 34.378906 40.589844 C 34.566406 40.847656 34.867188 41 35.1875 41 C 35.199219 41 35.210938 41 35.21875 41 C 37.027344 40.941406 44.960938 39.605469 47.867188 34.496094 C 47.953125 34.34375 48 34.175781 48 34 C 48 24.152344 43.785156 12.761719 41.625 10.769531 Z M 18.5 30 C 16.566406 30 15 28.210938 15 26 C 15 23.789063 16.566406 22 18.5 22 C 20.433594 22 22 23.789063 22 26 C 22 28.210938 20.433594 30 18.5 30 Z M 31.5 30 C 29.566406 30 28 28.210938 28 26 C 28 23.789063 29.566406 22 31.5 22 C 33.433594 22 35 23.789063 35 26 C 35 28.210938 33.433594 30 31.5 30 Z">
              </path>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/quocdaijr">
            <span class="sr-only">Github</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://facebook.com/quocdaijr">
            <span class="sr-only">Facebook</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/quocdaijr">
            <span class="sr-only">Linkedin</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
              class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
            </svg>
          </a>
        </div>
      </div>
      <div class="w-full text-left p-2 mt-3 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          </span>
          <span class="tracking-wide">About me</span>
        </div>
        <div class="text-sm">
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Name</div>
            <div class="col-span-2 px-4 py-2">Nguyen Quoc Dai</div>
          </div>
          <div class="grid  grid-cols-3">
            <div class="px-4 py-2 font-semibold">Phone</div>
            <div class="col-span-2 px-4 py-2">+84969-113-505</div>
          </div>
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Email</div>
            <div class="col-span-2 px-4 py-2">
              <a class="text-blue-600 dark:text-blue-400" href="mailto:quocdaijr@gmail.com">quocdaijr@gmail.com</a>
            </div>
          </div>
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Experience</div>
            <div class="col-span-2 px-4 py-2">6+ years in web development</div>
          </div>
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Role</div>
            <div class="col-span-2 px-4 py-2">Backend Software Engineer</div>
          </div>
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Address</div>
            <div class="col-span-2 px-4 py-2"> My Chanh Commune, Phu My District, Binh Dinh Province</div>
          </div>
        </div>
      </div>
    </div>
    <div class="pb-8 prose dark:prose-dark max-w-none xl:col-span-2 text-gray-600 dark:text-gray-300">
      <div class="mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </span>
          <span class="tracking-wide">Technical Skills</span>
        </div>
        <ul class="divide-y text-sm pl-2">
          <li class="py-3">
            <b>Backend Development</b>
            <p><span class="text-blue-600 dark:text-blue-400 font-medium">Expert:</span> PHP (Yii2, Laravel), Python</p>
            <p><span class="text-green-600 dark:text-green-400 font-medium">Proficient:</span> JavaScript, API Design,
              Microservices Architecture</p>
          </li>
          <li class="py-3">
            <b>Frontend Technologies</b>
            <p><span class="text-green-600 dark:text-green-400 font-medium">Proficient:</span> Vue.js, Nuxt.js, HTML5,
              CSS3, Tailwind CSS</p>
          </li>
          <li class="py-3">
            <b>Database & Storage</b>
            <p><span class="text-blue-600 dark:text-blue-400 font-medium">Expert:</span> MySQL, Redis, Elasticsearch</p>
            <p><span class="text-green-600 dark:text-green-400 font-medium">Proficient:</span> Database optimization,
              Query performance tuning</p>
          </li>
          <li class="py-3">
            <b>DevOps & Infrastructure</b>
            <p><span class="text-blue-600 dark:text-blue-400 font-medium">Expert:</span> Linux, Nginx, Git, Docker,
              Supervisor</p>
            <p><span class="text-green-600 dark:text-green-400 font-medium">Proficient:</span> AWS, K8s, RabbitMQ,
              Rancher, CI/CD pipelines</p>
          </li>
          <li class="py-3">
            <b>Third-party Integrations</b>
            <p>E-commerce platforms, Payment gateways, Analytics & tracking services, Customer engagement tools,
              Real-time communication systems, Project management platforms, API testing tools,...</p>
          </li>
        </ul>
      </div>
      <div class="mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </span>
          <span class="tracking-wide">Other Skills</span>
        </div>
        <ul class="divide-y text-sm pl-2">
          <li class="py-3">
            <p><b>Leadership & Initiative:</b> Proactive in identifying system improvements and taking ownership of
              complex technical challenges</p>
          </li>
          <li class="py-3">
            <p><b>Collaboration:</b> Experienced in cross-functional teamwork and mentoring junior developers while
              maintaining independent productivity</p>
          </li>
          <li class="py-3">
            <p><b>Problem Solving:</b> Strong analytical skills in debugging complex systems and architecting scalable
              solutions for high-traffic applications</p>
          </li>
          <li class="py-3">
            <p><b>Continuous Learning:</b> Actively stay current with emerging technologies and implement modern
              development practices</p>
          </li>
        </ul>
      </div>
      <div class="mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <span class="tracking-wide">Education & Experience</span>
        </div>
        <div class="pt-4">
          <div class="relative antialiased text-sm font-semibold text-gray-700 dark:text-gray-300">

            <!-- Vertical bar running through middle -->
            <div
              class="hidden sm:block w-1 bg-blue-500 dark:bg-blue-400 absolute h-full left-1/2 transform -translate-x-1/2">
            </div>

            <!-- Left section, set by justify-start and sm:pr-8 -->
            <div class="mt-6 sm:mt-0 sm:mb-12">
              <div class="flex flex-col sm:flex-row items-center">
                <div class="flex justify-start w-full mx-auto items-center">
                  <div class="w-full sm:w-1/2 sm:pr-8">
                    <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <i class="text-base">2014 - 2018</i>
                      <p class="text-sm font-normal pt-4">I studied at Ho Chi Minh University of Natural Resources and
                        Environment</p>
                      <p class="text-sm font-normal pt-4"><b>Major:</b> Information Technology</p>
                      <p class="text-sm font-normal pt-4"><b>GPA:</b> 2.52/4</p>
                      <p class="text-sm font-normal pt-4"><b>Degree:</b> Engineer's Degree</p>
                    </div>
                  </div>
                </div>
                <div class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Right section, set by justify-end and sm:pl-8 -->
            <div class="mt-6 sm:mt-0 sm:mb-12">
              <div class="flex flex-col sm:flex-row items-center">
                <div class="flex justify-end w-full mx-auto items-center">
                  <div class="w-full sm:w-1/2 sm:pl-8">
                    <div
                      class="p-4 bg-white rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <i class="text-base">20/08/2018 - 01/07/2019</i>
                      <p class="text-sm font-normal pt-4">I worked at Applancer JSC (onsite at Tuoi Tre Newspaper)</p>
                      <p class="text-sm font-normal pt-4"><b>Position:</b> Web Developer</p>
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Yii2 Framework, MySql,
                        Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry, CDN</p>
                      <div class="text-sm font-normal pt-4">
                        <b>Responsibilities:</b>
                        <p>- Maintained existing websites and implemented new features to enhance functionality</p>
                        <p>- Contributed to building and developing company website projects that handled high traffic
                          volumes and optimized user experience</p>
                        <p>- Utilized Linux, Docker, and Git effectively to support development workflows</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clip-rule="evenodd" />
                    <path
                      d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Left section, set by justify-start and sm:pr-8 -->
            <div class="mt-6 sm:mt-0 sm:mb-12">
              <div class="flex flex-col sm:flex-row items-center">
                <div class="flex justify-start w-full mx-auto items-center">
                  <div class="w-full sm:w-1/2 sm:pr-8">
                    <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <i class="text-base">01/07/2019 - 08/08/2022</i>
                      <p class="text-sm font-normal pt-4">I worked at Tuoi Tre Newspaper</p>
                      <p class="text-sm font-normal pt-4"><b>Position:</b> Web Developer</p>
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Python, Yii2 Framework, Django Rest
                        Framework, MySql, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker,
                        Supervisor, Sentry
                      </p>
                      <div class="text-sm font-normal pt-4">
                        <b>Key Achievements:</b>
                        <p>- Maintained and enhanced backend systems for high-traffic news websites serving millions of
                          users</p>
                        <p>- Designed database architecture and developed comprehensive backend APIs and console
                          applications for new projects</p>
                        <p>- Actively contributed to technical discussions and proposed innovative solutions for feature
                          requirements</p>
                        <p>- Built custom packages and microservices that improved system modularity and maintainability
                        </p>
                        <p>- Developed automated background processing scripts for data conversion, synchronization, and
                          aggregation tasks</p>
                        <p>- Successfully managed production deployments and configured services for optimal performance
                        </p>
                        <p>- Researched and implemented Single Sign-On (SSO) authentication system for seamless user
                          experience</p>
                        <p>- Utilized advanced DevOps tools including Ansible AWX, Sentry, and comprehensive logging
                          systems to monitor deployments and track user activities</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clip-rule="evenodd" />
                    <path
                      d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Right section, set by justify-end and sm:pl-8 -->
            <div class="mt-6 sm:mt-0 sm:mb-12">
              <div class="flex flex-col sm:flex-row items-center">
                <div class="flex justify-end w-full mx-auto items-center">
                  <div class="w-full sm:w-1/2 sm:pl-8">
                    <div
                      class="p-4 bg-white rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <i class="text-base">08/08/2022 - Present</i>
                      <p class="text-sm font-normal pt-4">I worked at FireGroup Technology</p>
                      <p class="text-sm font-normal pt-4"><b>Position:</b> Backend Software Engineer</p>
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Python, Laravel Framework, MySql,
                        Redis,
                        RabbitMQ, Gitlab, Linux, Docker, Supervisor, Sentry, Rancher</p>
                      <p class="text-sm font-normal pt-4"><b>3rd parties:</b> Shopify, Jira, Segment, CustomerIO, Crisp
                        Chat</p>
                      <div class="text-sm font-normal pt-4">
                        <b>Key Achievements:</b>
                        <p>- Architected and developed robust background processing tools that handle high-volume data
                          operations efficiently</p>
                        <p>- Designed comprehensive database schemas and built scalable backend systems for new
                          e-commerce projects</p>
                        <p>- Successfully inherited and maintained legacy Shopify application backends while ensuring
                          continuous service delivery</p>
                        <p>- Actively participated in technical planning sessions and contributed innovative solutions
                          for application feature development</p>
                        <p>- Seamlessly integrated multiple third-party services (both internal and external APIs) to
                          enhance application functionality</p>
                        <p>- Implemented comprehensive monitoring and deployment management using advanced DevOps tools
                          including Rancher, Sentry, Grafana, and centralized logging systems</p>
                        <p>- Continuously optimized system performance and implemented modern development practices for
                          enhanced scalability</p>
                        <p>- Proficient with AI-powered development tools and various LLM agents for code generation,
                          debugging, and workflow automation. Experienced with AI chat interfaces, code editors, and MCP
                          (Model Context Protocol) integrations (Vibe Coding 🤡)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                      clip-rule="evenodd" />
                    <path
                      d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleProfileImageError(event) {
      console.warn('Profile image failed to load:', event.target.src)
      // Replace with a fallback placeholder
      event.target.src = '/no-image.jpg'
      event.target.alt = 'Profile image not available'
    }
  },
  head() {
    return {
      title: 'Nguyen Quoc Dai - Profile',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'This is profile of Nguyen Quoc Dai'
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'QDJr, Nguyen Quoc Dai, profile, cv'
        },
        {
          hid: 'og:url',
          property: 'og:url',
          content: process.env.baseUrl + '/about'
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: 'Nguyen Quoc Dai - Profile'
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: 'This is profile of Nguyen Quoc Dai'
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: process.env.baseUrl + '/profile.jpg'
        }
      ]
    }
  }
}
</script>
