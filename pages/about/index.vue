<template>
  <div class="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
    <div class="flex flex-col items-center text-center pt-8 space-x-2">
      <div>
        <img alt="avatar" class="w-48 h-48 rounded-full" src="/profile.jpg">
      </div>
      <h3 class="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight text-gray-500 dark:text-gray-300">Nguyen Quoc
        Dai</h3>
      <div class="text-gray-500 dark:text-gray-300">Developer</div>
      <div class="text-gray-500 dark:text-gray-300">Ho Chi Minh City University of Natural Resources and Environment
      </div>
      <div class="flex pt-6 space-x-3">

        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="mailto:quocdaijr@gmail.com">
          <span class="sr-only">mail</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
          </svg>
        </a>
        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="https://github.com/quocdaijr">
          <span class="sr-only">github</span>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
          </svg>
        </a>
        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="https://facebook.com/quocdaijr">
          <span class="sr-only">facebook</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
          </svg>
        </a>
        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="https://www.youtube.com/channel/UCzJZRQgav2fv1018VFC2f2w">
          <span class="sr-only">youtube</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path
              d="M23.499 6.203a3.008 3.008 0 00-2.089-2.089c-1.87-.501-9.4-.501-9.4-.501s-7.509-.01-9.399.501a3.008 3.008 0 00-2.088 2.09A31.258 31.26 0 000 12.01a31.258 31.26 0 00.523 5.785 3.008 3.008 0 002.088 2.089c1.869.502 9.4.502 9.4.502s7.508 0 9.399-.502a3.008 3.008 0 002.089-2.09 31.258 31.26 0 00.5-5.784 31.258 31.26 0 00-.5-5.808zm-13.891 9.4V8.407l6.266 3.604z"></path>
          </svg>
        </a>
        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="https://www.linkedin.com/in/quocdaijr">
          <span class="sr-only">linkedin</span>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
          </svg>
        </a>
        <a class="text-sm text-gray-500 transition hover:text-gray-600" target="_blank" rel="noopener noreferrer"
           href="https://twitter.com/quocdaijr">
          <span class="sr-only">twitter</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               class="fill-current text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 h-8 w-8">
            <path
              d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
          </svg>
        </a>
      </div>
    </div>
    <div class="pt-8 pb-8 prose dark:prose-dark max-w-none xl:col-span-2 text-gray-600 dark:text-gray-300">
      <div>
        <p>This is my profile. I will update later :)))</p>
      </div>
      <div class="pt-10 w-full">
        <div class="relative antialiased text-sm font-semibold
              text-gray-700 dark:text-gray-300">

          <!-- Vertical bar running through middle -->
          <div
            class="hidden sm:block w-1 bg-blue-500 dark:bg-blue-400 absolute h-full left-1/2 transform -translate-x-1/2"></div>

          <!-- Left section, set by justify-start and sm:pr-8 -->
          <div class="mt-6 sm:mt-0 sm:mb-12">
            <div class="flex flex-col sm:flex-row items-center">
              <div class="flex justify-start w-full mx-auto items-center">
                <div class="w-full sm:w-1/2 sm:pr-8">
                  <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <i class="text-base">27/10/1996</i>
                    <p class="text-sm font-normal pt-4">I was born in Binh Dinh</p>
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
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Right section, set by justify-end and sm:pl-8 -->
          <div class="mt-6 sm:mt-0 sm:mb-12">
            <div class="flex flex-col sm:flex-row items-center">
              <div class="flex justify-end w-full mx-auto items-center">
                <div class="w-full sm:w-1/2 sm:pl-8">
                  <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <i class="text-base">2002 - 2007</i>
                    <p class="text-sm font-normal pt-4">I studied at My Chanh Number 1 Elementary School</p>
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

          <!-- Left section, set by justify-start and sm:pr-8 -->
          <div class="mt-6 sm:mt-0 sm:mb-12">
            <div class="flex flex-col sm:flex-row items-center">
              <div class="flex justify-start w-full mx-auto items-center">
                <div class="w-full sm:w-1/2 sm:pr-8">
                  <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <i class="text-base">2007 - 2011</i>
                    <p class="text-sm font-normal pt-4">I studied at My Chanh Middle School</p>
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
                    <i class="text-base">2011 - 2014</i>
                    <p class="text-sm font-normal pt-4">I studied at An Luong High School</p>
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

          <!-- Left section, set by justify-start and sm:pr-8 -->
          <div class="mt-6 sm:mt-0 sm:mb-12">
            <div class="flex flex-col sm:flex-row items-center">
              <div class="flex justify-start w-full mx-auto items-center">
                <div class="w-full sm:w-1/2 sm:pr-8">
                  <div class="p-4 rounded shadow bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    <i class="text-base">2014 - 2018</i>
                    <p class="text-sm font-normal pt-4">I studied at Ho Chi Minh University of Natural Resources and
                      Environment</p>
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
                    <p class="text-sm font-normal pt-4">+ Position: PHP Developer</p>
                    <p class="text-sm font-normal pt-4">+ Technologies: PHP, Yii2 Framework, MySql, Elasticsearch,
                      Redis, Nginx, RabbitMQ, Git, Linux, Docker, Supervisor, Sentry</p>
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
                    <i class="text-base">01/07/2019 - Now</i>
                    <p class="text-sm font-normal pt-4">I am working at Tuoi Tre Newspaper</p>
                    <p class="text-sm font-normal pt-4">+ Position: Backend Developer</p>
                    <p class="text-sm font-normal pt-4">+ Technologies: PHP, Python, Yii2 Framework, Django Rest
                      Framework, MySql, Elasticsearch, Redis, Memcached, Nginx, RabbitMQ, Git, Linux, Docker,
                      Supervisor, Sentry
                    </p>
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
</template>

<script>
export default {
  layout: "error",
  name: "index"
}
</script>
