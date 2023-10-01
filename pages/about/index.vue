<template>
  <div class="pt-8 items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
    <div class="flex flex-col items-center text-center text-gray-600 dark:text-gray-300">
      <div>
        <img alt="avatar" class="w-48 h-48 rounded-full hover:scale-105" src="/profile.jpg">
      </div>
      <h3 class="pt-4 pb-2 text-3xl font-bold leading-8 tracking-tight">Nguyen Quoc Dai</h3>
      <div class="font-bold p-1">Web Developer</div>
      <div class="text-justify">
        I am an web developer interested in projects that challenge my conceptual as well as my analytical thinking
        skills
      </div>
      <div class="w-full text-left p-2 mt-3 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
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
                d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757zm3.436-.586L16 11.801V4.697l-5.803 3.546z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://t.me/quocdaijr">
            <span class="sr-only">Telegram</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://join.skype.com/invite/us4pH3lzdQVP">
            <span class="sr-only">Skype</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M4.671 0c.88 0 1.733.247 2.468.702a7.423 7.423 0 0 1 6.02 2.118 7.372 7.372 0 0 1 2.167 5.215c0 .344-.024.687-.072 1.026a4.662 4.662 0 0 1 .6 2.281 4.645 4.645 0 0 1-1.37 3.294A4.673 4.673 0 0 1 11.18 16c-.84 0-1.658-.226-2.37-.644a7.423 7.423 0 0 1-6.114-2.107A7.374 7.374 0 0 1 .529 8.035c0-.363.026-.724.08-1.081a4.644 4.644 0 0 1 .76-5.59A4.68 4.68 0 0 1 4.67 0zm.447 7.01c.18.309.43.572.729.769a7.07 7.07 0 0 0 1.257.653c.492.205.873.38 1.145.523.229.112.437.264.615.448.135.142.21.331.21.528a.872.872 0 0 1-.335.723c-.291.196-.64.289-.99.264a2.618 2.618 0 0 1-1.048-.206 11.44 11.44 0 0 1-.532-.253 1.284 1.284 0 0 0-.587-.15.717.717 0 0 0-.501.176.63.63 0 0 0-.195.491.796.796 0 0 0 .148.482 1.2 1.2 0 0 0 .456.354 5.113 5.113 0 0 0 2.212.419 4.554 4.554 0 0 0 1.624-.265 2.296 2.296 0 0 0 1.08-.801c.267-.39.402-.855.386-1.327a2.09 2.09 0 0 0-.279-1.101 2.53 2.53 0 0 0-.772-.792A7.198 7.198 0 0 0 8.486 7.3a1.05 1.05 0 0 0-.145-.058 18.182 18.182 0 0 1-1.013-.447 1.827 1.827 0 0 1-.54-.387.727.727 0 0 1-.2-.508.805.805 0 0 1 .385-.723 1.76 1.76 0 0 1 .968-.247c.26-.003.52.03.772.096.274.079.542.177.802.293.105.049.22.075.336.076a.6.6 0 0 0 .453-.19.69.69 0 0 0 .18-.496.717.717 0 0 0-.17-.476 1.374 1.374 0 0 0-.556-.354 3.69 3.69 0 0 0-.708-.183 5.963 5.963 0 0 0-1.022-.078 4.53 4.53 0 0 0-1.536.258 2.71 2.71 0 0 0-1.174.784 1.91 1.91 0 0 0-.45 1.287c-.01.37.076.736.25 1.063z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/quocdaijr">
            <span class="sr-only">Github</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://facebook.com/quocdaijr">
            <span class="sr-only">Facebook</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/quocdaijr">
            <span class="sr-only">Linkedin</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
            </svg>
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/quocdaijr">
            <span class="sr-only">twitter</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 class="fill-current hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
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
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
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
            <div class="px-4 py-2 font-semibold">Gender</div>
            <div class="col-span-2 px-4 py-2">Male</div>
          </div>
          <div class="grid grid-cols-3">
            <div class="px-4 py-2 font-semibold">Birthday</div>
            <div class="col-span-2 px-4 py-2">October 27, 1996</div>
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
          </span>
          <span class="tracking-wide">Technical Skills</span>
        </div>
        <ul
          class="divide-y text-sm pl-2">
          <li class="py-3">
            <b>Programming languages</b>
            <p>PHP, Python, Javascript</p>
          </li>
          <li class="py-3">
            <b>Web Frameworks</b>
            <p>PHP: Yii2, Laravel</p>
            <p>Python: Django Rest Framework</p>
            <p>Javascript: VueJS, NuxtJS</p>
          </li>
          <li class="py-3">
            <b>Databases</b>
            <p>Mysql, Redis, Elasticsearch</p>
          </li>
          <li class="py-3">
            <b>Other technical skills</b>
            <p>Linux, Nginx, Git, AWS, Sentry, Docker, RabbitMQ, Supervisor</p>
          </li>
          <li class="py-3">
            <b>Worked with 3rd parties</b>
            <p>Shopify, Google, Paypal, Jira, Segment, CustomerIO, Pusher, Postman</p>
          </li>
        </ul>
      </div>
      <div class="mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"/>
          </svg>
          </span>
          <span class="tracking-wide">Other Skills</span>
        </div>
        <ul class="divide-y text-sm pl-2">
          <li class="py-3">
            <p>Positive, proactive and responsible at work</p>
          </li>
          <li class="py-3">
            <p>Ability to work well in a team as well as independently</p>
          </li>
          <li class="py-3">
            <p>Good problem solving ability</p>
          </li>
          <li class="py-3">
            <p>Ready to receive, learn and apply new technologies</p>
          </li>
        </ul>
      </div>
      <div class="mt-3 p-2 rounded hover:shadow-sm bg-gray-100 dark:bg-gray-800">
        <div class="flex items-center space-x-2 font-semibold leading-8">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </span>
          <span class="tracking-wide">Education & Experience</span>
        </div>
        <div class="pt-4">
          <div class="relative antialiased text-sm font-semibold text-gray-700 dark:text-gray-300">

            <!-- Vertical bar running through middle -->
            <div
              class="hidden sm:block w-1 bg-blue-500 dark:bg-blue-400 absolute h-full left-1/2 transform -translate-x-1/2"></div>

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
                <div
                  class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
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
                      <i class="text-base">20/08/2018 - 01/07/2014</i>
                      <p class="text-sm font-normal pt-4">I worked at Applancer JSC (onsite at Tuoi Tre Newspaper)</p>
                      <p class="text-sm font-normal pt-4"><b>Position:</b> Web Developer</p>
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Yii2 Framework, MySql,
                        Elasticsearch, Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry, CDN</p>
                      <div class="text-sm font-normal pt-4">
                        <b>Responsibilities:</b>
                        <p>- Participate in the maintenance and updating new features for existing websites</p>
                        <p>- Participated in building and developing website project of the company that ensured high
                          traffic, page views and user experience</p>
                        <p>- Worked well with Linux, Docker, Git to support development</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                          clip-rule="evenodd"/>
                    <path
                      d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
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
                      <p class="text-sm font-normal pt-4">I am working at Tuoi Tre Newspaper</p>
                      <p class="text-sm font-normal pt-4"><b>Position:</b> Web Developer</p>
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Python, Yii2 Framework, Django Rest
                        Framework, MySql, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker,
                        Supervisor, Sentry
                      </p>
                      <div class="text-sm font-normal pt-4">
                        <b>Responsibilities:</b>
                        <p>- Worked on maintenance and enhancements for backend of existing websites</p>
                        <p>- Designed data and developed backend, console and api for new website project</p>
                        <p>- Participated in discussions, proposed solutions for new features of the website when there
                          were new requirements</p>
                        <p>- Developed related packages and microservices for the existing main projects</p>
                        <p>- Developed scripts for different tasks running in the background (convert, sync and aggregate data,...)</p>
                        <p>- Deployed release code and configured the services for the production environment</p>
                        <p>- Research and build SSO Authentication system</p>
                        <p>- Worked with tools like Ansible AWX, Sentry, logging,... to manage and track automated
                          deployments and site and user activities.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                          clip-rule="evenodd"/>
                    <path
                      d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
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
                      <p class="text-sm font-normal pt-4"><b>Technologies:</b> PHP, Python, Laravel Framework, MySql, Redis,
                        RabbitMQ, Gitlab, Linux, Docker, Supervisor, Sentry, Rancher</p>
                      <p class="text-sm font-normal pt-4"><b>3rd parties:</b> Shopify, Jira, Segment, CustomerIO, Crisp Chat</p>
                      <div class="text-sm font-normal pt-4">
                        <b>Responsibilities:</b>
                        <p>- Build tools to handle background tasks</p>
                        <p>- Design data and develop backend for new project</p>
                        <p>- Receive and maintain the backend for old projects (App on Shopify)</p>
                        <p>- Participate in discussions and propose solutions for new features of the application</p>
                        <p>- Integrate with 3rd parties (internal and external) for application development</p>
                        <p>- Worked with tools like Rancher, Sentry, Grafana, logging,... to manage and track automated
                          deployments and site and user activities.</p>
                        <p>- Updating...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                    class="rounded-full border-4 w-8 h-8 absolute left-1/2 -translate-y-4
                sm:translate-y-0 transform -translate-x-1/2 flex items-center justify-center
                bg-blue-500 dark:bg-blue-400
                text-gray-200 dark:text-gray-100
                border-gray-200 dark:border-gray-100
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                          clip-rule="evenodd"/>
                    <path
                        d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
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
