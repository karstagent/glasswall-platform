# GlassWall UI Design System

## Overview

The GlassWall UI Design System implements the "Liquid Glass" design language, characterized by translucent surfaces, subtle animations, and a clean, modern aesthetic that emphasizes content while providing a unique and memorable visual identity.

## Design Principles

### 1. Translucent Clarity

- Use frosted glass surfaces that hint at underlying content
- Maintain content legibility through contrast and proper backdrop blur
- Create a sense of depth without overwhelming the user

### 2. Fluid Motion

- Animations should feel like movement through liquid
- Transitions between states should be smooth and natural
- Interface elements respond to user interaction with organic motion

### 3. Distortion-Free Content

- While surfaces may be translucent, content must remain sharp
- Text and interactive elements must maintain clarity
- Primary content areas use higher opacity backgrounds

### 4. Adaptive Luminosity

- Interface adapts to ambient conditions (light/dark mode)
- Colors shift subtly based on background content
- Contrast remains consistent regardless of backdrop

## Color System

### Primary Palette

The core colors that define the GlassWall brand and interface.

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Glass Blue | #3498db (alpha: 0.8) | #2980b9 (alpha: 0.8) | Primary buttons, links, active states |
| Glass Teal | #1abc9c (alpha: 0.8) | #16a085 (alpha: 0.8) | Success states, confirmations |
| Glass Purple | #9b59b6 (alpha: 0.8) | #8e44ad (alpha: 0.8) | Highlights, secondary actions |
| Glass Amber | #f39c12 (alpha: 0.8) | #d35400 (alpha: 0.8) | Warnings, notifications |
| Glass Red | #e74c3c (alpha: 0.8) | #c0392b (alpha: 0.8) | Errors, destructive actions |

### Neutral Palette

Foundational colors for surfaces, text, and backgrounds.

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| Glass White | #ffffff (alpha: 0.7) | #ffffff (alpha: 0.1) | Primary surface (light mode) |
| Glass Black | #000000 (alpha: 0.05) | #000000 (alpha: 0.7) | Primary surface (dark mode) |
| Content Primary | #333333 | #ffffff | Primary text |
| Content Secondary | #666666 | #aaaaaa | Secondary text |
| Content Muted | #999999 | #777777 | Disabled, hint text |
| Border Light | #eeeeee (alpha: 0.8) | #333333 (alpha: 0.8) | Light borders |
| Border Medium | #dddddd (alpha: 0.8) | #444444 (alpha: 0.8) | Medium borders |

### Opacity Guidelines

| Surface Type | Light Mode Opacity | Dark Mode Opacity |
|--------------|-------------------|-------------------|
| Primary Surface | 0.7 | 0.7 |
| Secondary Surface | 0.5 | 0.5 |
| Floating Elements | 0.9 | 0.8 |
| Overlays | 0.3 - 0.5 | 0.5 - 0.7 |
| Modal Backgrounds | 0.2 | 0.4 |

## Typography

### Font Family

- Primary: "Inter", sans-serif
- Monospace: "Fira Code", monospace

### Type Scale

| Name | Size (px/rem) | Weight | Line Height | Usage |
|------|---------------|--------|-------------|-------|
| Display | 48px/3rem | 700 | 1.1 | Large hero headlines |
| Heading 1 | 36px/2.25rem | 700 | 1.2 | Page titles |
| Heading 2 | 30px/1.875rem | 600 | 1.2 | Section titles |
| Heading 3 | 24px/1.5rem | 600 | 1.3 | Subsection titles |
| Heading 4 | 20px/1.25rem | 600 | 1.3 | Card titles |
| Heading 5 | 18px/1.125rem | 600 | 1.4 | Minor headings |
| Body Large | 18px/1.125rem | 400 | 1.5 | Featured content |
| Body | 16px/1rem | 400 | 1.5 | Main content |
| Body Small | 14px/0.875rem | 400 | 1.5 | Supporting content |
| Caption | 12px/0.75rem | 400 | 1.5 | Metadata, labels |

### Typography Guidelines

- Maintain minimum contrast ratio of 4.5:1 for accessibility
- Use proper hierarchy to guide users through content
- Keep line length between 45-75 characters for readability
- Text on glass surfaces should use subtle text shadow (0 0 10px rgba(0,0,0,0.1)) in light mode to enhance legibility

## Component Library

### Glass Card

A versatile container with translucent glass-like appearance.

```jsx
// React component example
const GlassCard = ({ children, elevation = 'medium', padding = 'medium' }) => (
  <div className={`glass-card elevation-${elevation} padding-${padding}`}>
    {children}
  </div>
);
```

**Properties:**
- `elevation`: low, medium, high (controls blur and shadow)
- `padding`: none, small, medium, large
- `interactive`: boolean (adds hover and focus states)

**CSS Implementation:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card.elevation-low {
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.glass-card.elevation-high {
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.glass-card.interactive {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
}
```

### Glass Button

Interactive buttons with glass-like appearance.

```jsx
// React component example
const GlassButton = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  onClick
}) => (
  <button 
    className={`glass-button ${variant} size-${size}`}
    onClick={onClick}
  >
    {children}
  </button>
);
```

**Properties:**
- `variant`: primary, secondary, outline, danger
- `size`: small, medium, large
- `disabled`: boolean

**CSS Implementation:**
```css
.glass-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.glass-button.primary {
  background-color: rgba(52, 152, 219, 0.8);
  color: white;
}

.glass-button.secondary {
  background-color: rgba(255, 255, 255, 0.3);
  color: #333;
}

.dark .glass-button.secondary {
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
}

.glass-button.outline {
  background-color: transparent;
  border: 1px solid rgba(52, 152, 219, 0.8);
  color: #3498db;
}

.dark .glass-button.outline {
  color: #2980b9;
}

.glass-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.glass-button:active {
  transform: translateY(0);
}
```

### Glass Input

Form inputs with glass-like appearance.

```jsx
// React component example
const GlassInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  label
}) => (
  <div className="glass-input-container">
    {label && <label className="glass-input-label">{label}</label>}
    <input 
      type={type} 
      className="glass-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);
```

**CSS Implementation:**
```css
.glass-input-container {
  margin-bottom: 1rem;
}

.glass-input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.glass-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dark .glass-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.glass-input:focus {
  outline: none;
  border-color: rgba(52, 152, 219, 0.8);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
}
```

### Glass Badge

Small indicators for labels, status, or counts.

```jsx
// React component example
const GlassBadge = ({ children, variant = 'default' }) => (
  <span className={`glass-badge ${variant}`}>
    {children}
  </span>
);
```

**CSS Implementation:**
```css
.glass-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
}

.glass-badge.default {
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-badge.default {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-badge.success {
  background-color: rgba(46, 204, 113, 0.3);
  color: #27ae60;
}

.glass-badge.warning {
  background-color: rgba(241, 196, 15, 0.3);
  color: #f39c12;
}

.glass-badge.danger {
  background-color: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.glass-badge.info {
  background-color: rgba(52, 152, 219, 0.3);
  color: #3498db;
}
```

### Glass Modal

Overlay dialogs with glass-like appearance.

```jsx
// React component example
const GlassModal = ({ 
  children, 
  isOpen, 
  onClose, 
  title,
  width = 'medium'
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div 
        className={`glass-modal width-${width}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-modal-header">
          <h3>{title}</h3>
          <button className="glass-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="glass-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
```

**CSS Implementation:**
```css
.glass-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.glass-modal {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.dark .glass-modal {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dark .glass-modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-modal-body {
  padding: 1.5rem;
}

.glass-modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.glass-modal-close:hover {
  opacity: 1;
}

.glass-modal.width-small {
  width: 400px;
}

.glass-modal.width-medium {
  width: 600px;
}

.glass-modal.width-large {
  width: 800px;
}
```

### Glass Navigation

Navigation bar with glass-like appearance.

```jsx
// React component example
const GlassNavigation = ({ items, activeIndex }) => (
  <nav className="glass-navigation">
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <a 
            href={item.url} 
            className={index === activeIndex ? 'active' : ''}
          >
            {item.icon && <span className="icon">{item.icon}</span>}
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);
```

**CSS Implementation:**
```css
.glass-navigation {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem;
}

.dark .glass-navigation {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-navigation ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.glass-navigation li {
  margin: 0 0.25rem;
}

.glass-navigation a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #555;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.dark .glass-navigation a {
  color: #ccc;
}

.glass-navigation a:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dark .glass-navigation a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.glass-navigation a.active {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.dark .glass-navigation a.active {
  background: rgba(52, 152, 219, 0.3);
  color: #3498db;
}

.glass-navigation .icon {
  margin-right: 0.5rem;
}
```

## Animations

### Animation Principles

1. **Liquid Flow**: Movements should resemble a liquid flowing from one state to another
2. **Natural Timing**: Use ease-in-out timing functions for organic feel
3. **Subtle Distortion**: Slight scale changes during transitions add to the glass-like quality
4. **Reduced Motion**: Always provide reduced motion alternatives for accessibility

### Standard Transitions

| Name | Duration | Timing Function | CSS Variable |
|------|----------|----------------|--------------|
| Quick | 150ms | ease-out | `--transition-quick` |
| Standard | 300ms | ease-in-out | `--transition-standard` |
| Expressive | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | `--transition-expressive` |
| Enter | 400ms | cubic-bezier(0, 0, 0.2, 1) | `--transition-enter` |
| Exit | 250ms | cubic-bezier(0.4, 0, 1, 1) | `--transition-exit` |

### Key Animation Examples

#### Liquid Ripple Effect

```css
@keyframes liquid-ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.liquid-ripple {
  position: relative;
  overflow: hidden;
}

.liquid-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
}

.liquid-ripple:active::after {
  animation: liquid-ripple 0.8s ease-out;
}
```

#### Glass Card Hover

```css
.glass-card-hover {
  transition: transform var(--transition-standard), 
              box-shadow var(--transition-standard),
              backdrop-filter var(--transition-standard);
  backdrop-filter: blur(10px);
}

.glass-card-hover:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
}
```

#### Modal Transition

```css
.glass-modal-enter {
  animation: glass-modal-fade-in var(--transition-enter);
}

.glass-modal-exit {
  animation: glass-modal-fade-out var(--transition-exit);
}

@keyframes glass-modal-fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
    backdrop-filter: blur(20px);
  }
}

@keyframes glass-modal-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
    backdrop-filter: blur(20px);
  }
  to {
    opacity: 0;
    transform: scale(1.05);
    backdrop-filter: blur(0);
  }
}
```

#### Focus Ring Animation

```css
.glass-focus-ring {
  transition: box-shadow var(--transition-quick);
}

.glass-focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
  animation: glass-focus-pulse 1.5s infinite;
}

@keyframes glass-focus-pulse {
  0% {
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(52, 152, 219, 0.3);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.5);
  }
}
```

## Icons and Illustrations

### Icon System

- Use line icons with 1.5px stroke width
- Rounded corners (2px radius)
- Consistent 24x24px viewbox
- Available in both filled and outlined variants

### Icon Animation Guidelines

- Subtle animations on hover (scale: 1.05, duration: 200ms)
- Interactive icons should have clear active states
- Animation direction should match the icon's semantic meaning
- Keep animations subtle to avoid visual noise

### Illustration Style

- Semi-abstract representations with fluid shapes
- Consistent color palette using the GlassWall colors
- Subtle gradients to enhance depth perception
- Optional frosted glass overlay effect for consistency

## Layouts & Responsive Design

### Grid System

- 12-column grid with 24px gutters
- Container max-width: 1200px (can be overridden)
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 641px - 1024px
  - Desktop: > 1024px

### Spacing System

| Name | Size (px/rem) | CSS Variable |
|------|--------------|--------------|
| 3xs | 4px/0.25rem | `--space-3xs` |
| 2xs | 8px/0.5rem | `--space-2xs` |
| xs | 12px/0.75rem | `--space-xs` |
| sm | 16px/1rem | `--space-sm` |
| md | 24px/1.5rem | `--space-md` |
| lg | 32px/2rem | `--space-lg` |
| xl | 48px/3rem | `--space-xl` |
| 2xl | 64px/4rem | `--space-2xl` |
| 3xl | 96px/6rem | `--space-3xl` |

### Layout Components

#### Glass Container

```jsx
// React component example
const GlassContainer = ({ 
  children, 
  width = 'standard',
  padding = 'md'
}) => (
  <div className={`glass-container width-${width} padding-${padding}`}>
    {children}
  </div>
);
```

**CSS Implementation:**
```css
.glass-container {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.glass-container.width-standard {
  max-width: 1200px;
}

.glass-container.width-narrow {
  max-width: 800px;
}

.glass-container.width-wide {
  max-width: 1600px;
}

.glass-container.padding-md {
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}
```

#### Glass Grid

```jsx
// React component example
const GlassGrid = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 'md'
}) => (
  <div 
    className={`glass-grid gap-${gap}`}
    style={{
      '--mobile-columns': columns.mobile,
      '--tablet-columns': columns.tablet,
      '--desktop-columns': columns.desktop
    }}
  >
    {children}
  </div>
);
```

**CSS Implementation:**
```css
.glass-grid {
  display: grid;
  grid-template-columns: repeat(var(--mobile-columns, 1), 1fr);
}

.glass-grid.gap-md {
  gap: var(--space-md);
}

@media (min-width: 641px) {
  .glass-grid {
    grid-template-columns: repeat(var(--tablet-columns, 2), 1fr);
  }
}

@media (min-width: 1025px) {
  .glass-grid {
    grid-template-columns: repeat(var(--desktop-columns, 4), 1fr);
  }
}
```

## Accessibility Guidelines

### Color Contrast

- Text: Maintain minimum contrast ratio of 4.5:1
- UI Components: Maintain minimum contrast ratio of 3:1
- Test all components in both light and dark modes

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus states must be clearly visible
- Logical tab order should be maintained

### Screen Readers

- Use semantic HTML elements
- Include appropriate ARIA labels where needed
- Test all components with screen readers

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .glass-card-hover:hover {
    transform: none;
  }
}
```

## Implementation Guide

### Tailwind CSS Integration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'glass-blue': {
          DEFAULT: 'rgba(52, 152, 219, 0.8)',
          solid: '#3498db'
        },
        'glass-teal': {
          DEFAULT: 'rgba(26, 188, 156, 0.8)',
          solid: '#1abc9c'
        },
        // Additional colors...
      },
      boxShadow: {
        'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'glass-md': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 10px 30px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'glass-sm': '5px',
        'glass-md': '10px',
        'glass-lg': '20px',
      }
    }
  },
  plugins: [
    require('./plugins/glass-ui')
  ]
};
```

### Next.js Component Setup

```jsx
// components/GlassUI/index.js
export { default as GlassCard } from './GlassCard';
export { default as GlassButton } from './GlassButton';
export { default as GlassInput } from './GlassInput';
// Export additional components...
```

### Liquid Glass Effects

```css
/* For replicating liquid glass motion */
.liquid-motion {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  will-change: transform, opacity;
}

.liquid-motion:hover {
  transform: scale(1.02) translateY(-2px);
}

/* Glass blur effect */
.glass-blur {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Glass background effect with proper fallbacks */
.glass-bg {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

@supports not (backdrop-filter: blur(10px)) {
  .glass-bg {
    background: rgba(255, 255, 255, 0.9);
  }
  
  .dark .glass-bg {
    background: rgba(30, 30, 30, 0.9);
  }
}
```

## Usage Examples

### Chat Room UI

```jsx
// Example of a chat room layout
const ChatRoom = () => (
  <div className="chat-room-container">
    <GlassNavigation 
      items={[
        { label: 'Messages', icon: <MessageIcon />, url: '#messages' },
        { label: 'Members', icon: <UsersIcon />, url: '#members' },
        { label: 'Settings', icon: <SettingsIcon />, url: '#settings' },
      ]}
      activeIndex={0}
    />
    
    <div className="chat-content">
      <GlassCard elevation="low" padding="medium">
        <h2>Daily Help Chat</h2>
        <p>Get assistance with everyday tasks</p>
        <GlassBadge variant="success">Online</GlassBadge>
      </GlassCard>
      
      <div className="message-list">
        {messages.map(message => (
          <GlassCard 
            key={message.id}
            elevation="medium"
            padding="medium"
            className={message.isFromUser ? 'user-message' : 'agent-message'}
          >
            <div className="message-header">
              <span className="message-name">{message.name}</span>
              <span className="message-time">{message.time}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </GlassCard>
        ))}
      </div>
      
      <div className="message-input-container">
        <GlassInput 
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <GlassButton variant="primary">Send</GlassButton>
      </div>
    </div>
  </div>
);
```

### Agent Dashboard

```jsx
// Example of an agent dashboard
const AgentDashboard = () => (
  <div className="dashboard-container">
    <header className="dashboard-header">
      <h1>HelperBot Dashboard</h1>
      <GlassBadge variant="info">Agent View</GlassBadge>
    </header>
    
    <GlassGrid
      columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      gap="md"
    >
      <GlassCard elevation="medium" padding="medium">
        <h3>Message Queue</h3>
        <div className="stat-value">15</div>
        <GlassButton variant="secondary" size="small">
          Process Batch
        </GlassButton>
      </GlassCard>
      
      <GlassCard elevation="medium" padding="medium">
        <h3>Active Users</h3>
        <div className="stat-value">42</div>
        <GlassButton variant="secondary" size="small">
          View Details
        </GlassButton>
      </GlassCard>
      
      <GlassCard elevation="medium" padding="medium">
        <h3>Response Time</h3>
        <div className="stat-value">5m 12s</div>
        <GlassButton variant="secondary" size="small">
          View Analytics
        </GlassButton>
      </GlassCard>
    </GlassGrid>
    
    <GlassCard elevation="low" padding="large" className="recent-messages">
      <h2>Recent Messages</h2>
      <table className="message-table">
        {/* Table content */}
      </table>
    </GlassCard>
  </div>
);
```

## Migration Guide

### From Standard UI to Glass UI

1. Replace solid backgrounds with translucent ones
2. Add backdrop-filter to containers
3. Update shadow styles to match glass effect
4. Adjust colors for proper contrast through glass
5. Enhance transitions with liquid motion principles

### Compatibility Notes

- IE11 and older browsers: Fallback to solid backgrounds
- Safari: Test backdrop-filter with -webkit- prefix
- Mobile devices: Test performance, reduce blur intensity if needed