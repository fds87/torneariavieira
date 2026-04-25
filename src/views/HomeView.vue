<template>
  <div class="bg-bg min-h-screen">
    <AppHeader />
    <main>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <WhyUsSection />
      <ContactSection />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'
import HeroSection from '../components/sections/HeroSection.vue'
import ServicesSection from '../components/sections/ServicesSection.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import WhyUsSection from '../components/sections/WhyUsSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'
</script>
