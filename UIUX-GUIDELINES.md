# UI/UX Guidelines for Prisma Admin

This document outlines the UI/UX guidelines for the Prisma Admin project, with a focus on Tailwind CSS implementation and comprehensive RTL/LTR support.

## Table of Contents
- [Core Design Principles](#core-design-principles)
- [Tailwind CSS Implementation](#tailwind-css-implementation)
- [RTL/LTR Support](#rtlltr-support)
- [Component Guidelines](#component-guidelines)
- [Accessibility Standards](#accessibility-standards)
- [Performance Optimization](#performance-optimization)

## Core Design Principles

### 1. Visual Hierarchy
- Use Tailwind's spacing scale consistently: `space-1` (0.25rem) to `space-96` (24rem)
- Maintain 8-point grid system using Tailwind classes: `p-2`, `m-4`, `gap-8`
- Typography scale following Tailwind's defaults:
  - `text-xs`: 0.75rem
  - `text-sm`: 0.875rem
  - `text-base`: 1rem (body text)
  - `text-lg`: 1.125rem
  - `text-xl`: 1.25rem (subheadings)
  - `text-2xl`: 1.5rem (headings)

### 2. Color System
```css
/* Use CSS variables for consistent theming */
:root {
  --color-primary: theme('colors.blue.600');
  --color-secondary: theme('colors.gray.600');
  --color-success: theme('colors.green.600');
  --color-warning: theme('colors.yellow.600');
  --color-error: theme('colors.red.600');
}
```

### 3. Responsive Design
Always use mobile-first approach with Tailwind breakpoints:
- Default: < 640px
- `sm:`: 640px
- `md:`: 768px
- `lg:`: 1024px
- `xl:`: 1280px
- `2xl:`: 1536px

## Tailwind CSS Implementation

### 1. Logical Properties Usage
**Always use logical utility classes instead of physical ones:**

```html
<!-- ❌ NEVER use physical properties -->
<div class="ml-4 mr-2 pl-6 pr-3 left-0 text-left">

<!-- ✅ ALWAYS use logical properties -->
<div class="ms-4 me-2 ps-6 pe-3 start-0 text-start">
```

### 2. Common Patterns

#### Spacing
```html
<!-- Margins -->
<div class="ms-4">     <!-- margin-inline-start -->
<div class="me-4">     <!-- margin-inline-end -->
<div class="mx-4">     <!-- margin-inline (both) -->

<!-- Padding -->
<div class="ps-4">     <!-- padding-inline-start -->
<div class="pe-4">     <!-- padding-inline-end -->
<div class="px-4">     <!-- padding-inline (both) -->

<!-- Block spacing remains the same -->
<div class="mt-4 mb-4 py-4">  <!-- These work universally -->
```

#### Positioning
```html
<!-- ❌ Avoid -->
<div class="absolute left-0 right-4">

<!-- ✅ Use -->
<div class="absolute start-0 end-4">
<div class="absolute inset-x-4">  <!-- For equal spacing -->
```

#### Text Alignment
```html
<!-- ❌ Avoid -->
<p class="text-left">
<p class="text-right">

<!-- ✅ Use -->
<p class="text-start">
<p class="text-end">
<p class="text-center">  <!-- Center is universal -->
```

#### Borders
```html
<!-- ❌ Avoid -->
<div class="border-l-4 border-r-2">

<!-- ✅ Use -->
<div class="border-s-4 border-e-2">
```

### 3. Flexbox & Grid
```html
<!-- Flex direction aware of reading direction -->
<div class="flex flex-row">  <!-- Respects dir attribute -->
<div class="flex flex-row-reverse">  <!-- Reverses based on dir -->

<!-- Grid with logical placement -->
<div class="grid grid-cols-3 gap-4">
  <div class="col-start-1">  <!-- Not col-left -->
  <div class="col-end-3">    <!-- Not col-right -->
</div>
```

## RTL/LTR Support

### 1. Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom utilities for RTL support
      screens: {
        'rtl': { 'raw': '[dir="rtl"] &' },
        'ltr': { 'raw': '[dir="ltr"] &' },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Consider adding tailwindcss-rtl plugin for additional utilities
  ],
};
```

### 2. HTML Structure
```html
<!-- Set direction on root -->
<html dir="auto" lang="en">

<!-- Component-level direction control -->
<div dir="ltr" class="...">English content</div>
<div dir="rtl" class="...">محتوى عربي</div>
```

### 3. Component Examples

#### Admin Card Component
```tsx
const AdminCard = ({ title, children }) => (
  <div class="bg-white rounded-lg shadow-md p-6">
    {/* Header */}
    <div class="flex items-center gap-3 mb-4">
      <h3 class="text-lg font-semibold text-start">{title}</h3>
    </div>
    
    {/* Content */}
    <div class="text-gray-600 text-start">
      {children}
    </div>
    
    {/* Actions */}
    <div class="flex gap-2 justify-end mt-4">
      <button class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
        Cancel
      </button>
      <button class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">
        Save
      </button>
    </div>
  </div>
);
```

#### Data Table
```tsx
const DataTable = () => (
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b">
          <th class="px-4 py-2 text-start">Name</th>
          <th class="px-4 py-2 text-start">Email</th>
          <th class="px-4 py-2 text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b hover:bg-gray-50">
          <td class="px-4 py-2 text-start">John Doe</td>
          <td class="px-4 py-2 text-start">john@example.com</td>
          <td class="px-4 py-2 text-end">
            <button class="text-blue-600 hover:underline">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);
```

#### Form Layout
```tsx
const FormField = ({ label, type = "text" }) => (
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 text-start mb-1">
      {label}
    </label>
    <input
      type={type}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);
```

### 4. Icons & Directional Elements
```tsx
// Chevron icon that flips in RTL
const ChevronIcon = () => (
  <svg class="w-4 h-4 rtl:scale-x-[-1]" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
);

// Back button that adapts to reading direction
const BackButton = () => (
  <button class="flex items-center gap-2">
    <svg class="w-4 h-4 rtl:scale-x-[-1]">
      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    <span>Back</span>
  </button>
);
```

### 5. RTL-Specific Utilities
```html
<!-- Conditional styling -->
<div class="ltr:ms-4 rtl:me-4">          <!-- Different margin per direction -->
<svg class="rtl:scale-x-[-1]">           <!-- Flip horizontally in RTL -->
<div class="ltr:rounded-l-lg rtl:rounded-r-lg">  <!-- Conditional rounding -->

<!-- Force specific direction -->
<div dir="ltr" class="...">Always LTR content (e.g., code blocks)</div>
```

## Component Guidelines

### 1. Admin Panel Components

#### Navigation Sidebar
```tsx
const Sidebar = () => (
  <aside class="w-64 bg-gray-900 text-white h-screen">
    <div class="p-4">
      <h1 class="text-xl font-bold text-start">Prisma Admin</h1>
    </div>
    <nav class="mt-8">
      <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-800">
        <Icon />
        <span class="text-start">Dashboard</span>
      </a>
    </nav>
  </aside>
);
```

#### Filter Panel
```tsx
const FilterPanel = () => (
  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="font-semibold text-start mb-4">Filters</h3>
    <div class="space-y-4">
      <select class="w-full px-3 py-2 border rounded text-start">
        <option>All Status</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
    </div>
  </div>
);
```

### 2. Touch Targets
- Minimum size: 44x44px (11 Tailwind units)
- Use `min-h-[44px] min-w-[44px]` for custom sizing
- Ensure adequate spacing between interactive elements

### 3. Loading States
```tsx
const LoadingSpinner = () => (
  <div class="flex justify-center items-center p-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);
```

## Accessibility Standards

### 1. Color Contrast
- Normal text: 4.5:1 ratio (use `text-gray-700` on white background)
- Large text: 3:1 ratio (use `text-gray-600` for 18px+ text)
- Interactive elements: 3:1 ratio minimum

### 2. Focus States
```css
/* Custom focus styles for better visibility */
.focus-visible:focus {
  @apply outline-none ring-2 ring-blue-500 ring-offset-2;
}
```

### 3. Screen Reader Support
```html
<!-- Use semantic HTML -->
<nav aria-label="Main navigation">
<main role="main">
<section aria-labelledby="section-heading">

<!-- Proper ARIA labels -->
<button aria-label="Close dialog" class="...">
  <XIcon aria-hidden="true" />
</button>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  {/* Status messages */}
</div>
```

### 4. Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order (follows reading direction)
- Visible focus indicators
- Skip links for main content

## Performance Optimization

### 1. CSS Optimization
```html
<!-- Use Tailwind's purge to minimize CSS -->
<!-- Only include utilities you actually use -->
<!-- Consider using CSS modules for component-specific styles -->
```

### 2. Component Performance
```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

### 3. Image Optimization
```html
<!-- Use Next.js Image component -->
<Image
  src="/admin-logo.png"
  alt="Admin Logo"
  width={200}
  height={50}
  priority
/>
```

## Best Practices Checklist

### Before Development
- [ ] Set up RTL/LTR testing environment
- [ ] Configure Tailwind with logical properties
- [ ] Plan component structure with bidirectional support

### During Development
- [ ] Use logical properties exclusively (`ms-*`, `me-*`, not `ml-*`, `mr-*`)
- [ ] Test all components in both LTR and RTL
- [ ] Ensure proper text alignment (`text-start`, `text-end`)
- [ ] Mirror directional icons and graphics
- [ ] Maintain consistent spacing using Tailwind's scale

### Before Release
- [ ] Verify WCAG 2.2 compliance
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios
- [ ] Validate screen reader compatibility
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing including RTL mode

## Quick Reference

| Physical | Logical | Tailwind Utility |
|----------|---------|------------------|
| left | start | `start-*` |
| right | end | `end-*` |
| margin-left | margin-inline-start | `ms-*` |
| margin-right | margin-inline-end | `me-*` |
| padding-left | padding-inline-start | `ps-*` |
| padding-right | padding-inline-end | `pe-*` |
| text-align: left | text-align: start | `text-start` |
| text-align: right | text-align: end | `text-end` |
| border-left | border-inline-start | `border-s-*` |
| border-right | border-inline-end | `border-e-*` |

## Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [RTL Styling Guide](https://rtlstyling.com/)