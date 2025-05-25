# Nuxt 3 Migration Checklist

## 🔧 Essential Fixes for Nuxt 2 → Nuxt 3 Migration

### 1. Layout Components
- [ ] Replace `<Nuxt/>` with `<NuxtPage/>`
- [ ] Replace `<client-only>` with `<ClientOnly>`
- [ ] Update head configuration to use `useHead()` composable

### 2. State Management
- [ ] Replace Vuex with Pinia
- [ ] Update all `this.$store` references
- [ ] Create new store files in `stores/` directory
- [ ] Use `defineStore()` for store definitions

### 3. Composition API Migration
- [ ] Convert Options API to Composition API where beneficial
- [ ] Use `<script setup>` for new components
- [ ] Replace `asyncData` with `useFetch()` or `$fetch`
- [ ] Update `fetch()` hooks to use composables

### 4. Plugin System
- [ ] Update plugin syntax to use `defineNuxtPlugin()`
- [ ] Add `.client.ts` or `.server.ts` suffixes as needed
- [ ] Update plugin registration in `nuxt.config.ts`
- [ ] Add null checks for optional plugins

### 5. TypeScript Integration
- [ ] Add TypeScript support to `nuxt.config.ts`
- [ ] Create type definitions for stores and composables
- [ ] Update component props with proper typing
- [ ] Run `npm run typecheck` to verify

### 6. Configuration Updates
- [ ] Update `nuxt.config.js` to `nuxt.config.ts`
- [ ] Update module syntax and configuration
- [ ] Check plugin compatibility with Nuxt 3
- [ ] Update build and deployment scripts

## 🚨 Common Runtime Errors & Quick Fixes

### Error: "Cannot read property '$store' of undefined"
```javascript
// ❌ Nuxt 2 (Vuex)
this.$store.dispatch('action')

// ✅ Nuxt 3 (Pinia)
const store = useMyStore()
store.myAction()
```

### Error: "Nuxt component not found"
```vue
<!-- ❌ Nuxt 2 -->
<Nuxt/>

<!-- ✅ Nuxt 3 -->
<NuxtPage/>
```

### Error: "client-only is not a valid component"
```vue
<!-- ❌ Nuxt 2 -->
<client-only>
  <my-component/>
</client-only>

<!-- ✅ Nuxt 3 -->
<ClientOnly>
  <my-component/>
</ClientOnly>
```

### Error: "head property not recognized"
```vue
<!-- ❌ Nuxt 2 -->
<script>
export default {
  head: { title: 'My Page' }
}
</script>

<!-- ✅ Nuxt 3 -->
<script setup>
useHead({ title: 'My Page' })
</script>
```

## 🛠️ Development Workflow

### 1. Start Development Server
```bash
npm run dev
# Server will start on http://localhost:3000
```

### 2. Check for TypeScript Errors
```bash
npm run typecheck
```

### 3. Build for Production
```bash
npm run build
```

### 4. Test All Routes
```bash
# Test main routes
curl -I http://localhost:3000
curl -I http://localhost:3000/about
curl -I http://localhost:3000/blog
```

## 📋 Testing Checklist

### Functionality Testing
- [ ] Application loads without errors
- [ ] All routes respond with HTTP 200
- [ ] Theme switching works in both directions
- [ ] Navigation links work correctly
- [ ] Content renders properly
- [ ] Mobile responsive design works

### Technical Testing
- [ ] TypeScript compilation passes
- [ ] Production build completes successfully
- [ ] No console errors in browser
- [ ] HMR (Hot Module Reload) working
- [ ] All plugins loading correctly

### Performance Testing
- [ ] Fast initial page load
- [ ] Smooth route transitions
- [ ] Responsive theme switching
- [ ] Optimized bundle size

## 🎯 Success Criteria

✅ **Application Loads**: No critical runtime errors  
✅ **Routing Works**: All pages accessible and functional  
✅ **Theme System**: Dark/light mode switching operational  
✅ **Content Renders**: All components displaying correctly  
✅ **TypeScript**: Full compilation without errors  
✅ **Build Process**: Production build successful  

## 📞 Troubleshooting

### Server Won't Start
1. Clear `.nuxt` directory: `rm -rf .nuxt`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check for port conflicts
4. Verify Node.js version compatibility

### Content Not Rendering
1. Check layout uses `<NuxtPage/>`
2. Verify page files in `pages/` directory
3. Check for JavaScript errors in console
4. Ensure components are properly imported

### Theme Not Working
1. Verify Pinia store is properly configured
2. Check plugin registration in `nuxt.config.ts`
3. Ensure theme classes are applied to DOM
4. Test localStorage persistence

### Build Failures
1. Run TypeScript check: `npm run typecheck`
2. Check for missing dependencies
3. Verify all imports are correct
4. Clear build cache and retry

---

**Quick Reference**: Keep this checklist handy during Nuxt 3 migrations to ensure all critical issues are addressed systematically.
