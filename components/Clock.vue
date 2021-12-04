<template>
  <section class="text-center text-gray-600 dark:text-gray-300">
    <div class="my-auto">
<!--      <p class="text-2xl tracking-widest sm:text-4xl">{{ date }}</p>-->
<!--      <p class="text-4xl tracking-wider	sm:text-8xl py-5">{{ time }}</p>-->
      <p class="tracking-widest">{{ date }}</p>
      <p class="tracking-wider pt-2">{{ time }}</p>
    </div>
  </section>
</template>

<script>

function zeroPadding(num, digit) {
  let zero = '';
  for (let i = 0; i < digit; i++) {
    zero += '0';
  }
  return (zero + num).slice(-digit);
}

export default {
  name: "Clock",
  data() {
    return {
      time: 0,
      date: 0
    }
  },
  created() {
    this.updateDate()
    setInterval(this.updateDate, 1000);
  },
  methods: {
    updateDate() {
      const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const cd = new Date();
      this.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
      this.date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
    }
  }
}
</script>
