# 🧪 RegressLab Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14.2+-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1+-blue.svg)](https://tailwindcss.com)

The frontend application for RegressLab - a modern, responsive machine learning dashboard built with Next.js, featuring real-time data visualization, model management, and seamless Supabase integration.

## 🚀 Features

- **📊 Interactive Dashboard**: Real-time data visualization with Recharts
- **🔐 Secure Authentication**: Supabase Auth integration with JWT tokens
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🌙 Dark/Light Theme**: Seamless theme switching with next-themes
- **📈 Data Visualization**: Interactive charts for model performance metrics
- **🎨 Modern UI**: Beautiful components built with shadcn/ui and Radix UI
- **⚡ Performance**: Optimized with Next.js App Router and TypeScript
- **🔌 Real-time Updates**: Live data updates with Supabase subscriptions

## 🏗️ Architecture

```
frontend/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard pages
│   │   ├── upload/          # Dataset upload interface
│   │   ├── train/           # Model training interface
│   │   ├── predictions/     # Prediction interface
│   │   ├── visualizations/  # Charts and metrics
│   │   ├── history/         # Training history
│   │   ├── models/          # Model management
│   │   │   └── [id]/        # Individual model pages
│   │   ├── assistant/       # AI assistant interface
│   │   └── settings/         # User settings
│   ├── sign-in/             # Authentication pages
│   ├── sign-up/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card component
│   │   ├── chart.tsx        # Chart components
│   │   ├── form.tsx         # Form components
│   │   ├── input.tsx        # Input components
│   │   ├── table.tsx        # Table components
│   │   └── ...              # Other UI components
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── dataset-upload.tsx
│   │   ├── model-card.tsx
│   │   └── metrics-chart.tsx
│   ├── theme-provider.tsx   # Theme context provider
│   ├── theme-toggle.tsx     # Theme switcher
│   └── ...                  # Other components
├── lib/                     # Utility libraries
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
│   ├── use-mobile.ts        # Mobile detection hook
│   └── use-toast.ts         # Toast notification hook
├── styles/                  # Styling
│   └── globals.css          # Global CSS
├── public/                  # Static assets
│   ├── images/              # Image assets
│   └── icons/               # Icon assets
├── package.json             # Dependencies and scripts
├── next.config.mjs          # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── components.json          # shadcn/ui configuration
└── README.md                # This file
```

## ⚙️ Tech Stack

### Core Framework
- **Next.js** (14.2+) - React framework with App Router
- **React** (18+) - UI library with hooks and modern patterns
- **TypeScript** (5+) - Type-safe JavaScript development

### Styling & UI
- **Tailwind CSS** (4.1+) - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** (0.454+) - Beautiful, customizable icons
- **next-themes** - Dark/light theme support
- **class-variance-authority** - Component variant management
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging utility

### Data Visualization
- **Recharts** - Composable charting library for React
- **React Hook Form** (7.60+) - Performant forms with validation
- **Zod** (3.25+) - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation resolvers

### Authentication & API
- **Supabase JS Client** (2.75+) - Client library for Supabase services
- **@supabase/auth-helpers-nextjs** (0.10+) - Next.js authentication helpers
- **@supabase/ssr** (0.7+) - Server-side rendering support

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** (8.5+) - CSS processing
- **Autoprefixer** (10.4+) - CSS vendor prefixing
- **@types/node** (22+) - Node.js type definitions
- **@types/react** (18+) - React type definitions

### Additional Libraries
- **date-fns** (4.1+) - Date utility library
- **cmdk** (1.0.4) - Command palette component
- **embla-carousel-react** (8.5.1) - Carousel component
- **react-resizable-panels** (2.1.7) - Resizable panel components
- **sonner** (1.7.4) - Toast notification library
- **vaul** (0.9.9) - Drawer component

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id

# Optional: Development
NEXT_PUBLIC_DEBUG=false
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RegressLab.git
   cd RegressLab/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to http://localhost:3000

### Verify Installation

- **Frontend**: http://localhost:3000
- **Sign Up**: http://localhost:3000/sign-up
- **Dashboard**: http://localhost:3000/dashboard (after authentication)

## 📚 Component Documentation

### Core Components

#### UI Components (shadcn/ui)

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Usage
<Card>
  <CardHeader>
    <CardTitle>Model Training</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter dataset name" />
    <Button>Train Model</Button>
  </CardContent>
</Card>
```

#### Chart Components

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Model 1', accuracy: 0.85, loss: 0.15 },
  { name: 'Model 2', accuracy: 0.92, loss: 0.08 },
]

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" />
  <Line type="monotone" dataKey="loss" stroke="#82ca9d" />
</LineChart>
```

#### Theme Components

```tsx
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

// In your layout
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <ThemeToggle />
  {children}
</ThemeProvider>
```

### Custom Hooks

#### Authentication Hook

```tsx
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

function useAuth() {
  const supabase = useSupabaseClient()
  const user = useUser()
  
  const signOut = async () => {
    await supabase.auth.signOut()
  }
  
  return { user, signOut }
}
```

#### API Hook

```tsx
import { useState, useEffect } from 'react'

function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [url])
  
  return { data, loading, error }
}
```

## 🎨 Styling Guide

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### CSS Variables

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

## 🔌 API Integration

### Supabase Client Setup

```tsx
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### API Service Layer

```tsx
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = await this.getAuthToken()
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }
  
  async uploadDataset(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    return this.request('/api/datasets', {
      method: 'POST',
      body: formData,
    })
  }
  
  async trainModel(datasetId: string, algorithm?: string) {
    return this.request('/api/train', {
      method: 'POST',
      body: JSON.stringify({ dataset_id: datasetId, algorithm }),
    })
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- components/Button.test.tsx
```

### Test Structure

```
__tests__/
├── components/
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   └── Chart.test.tsx
├── pages/
│   ├── dashboard.test.tsx
│   └── auth.test.tsx
└── utils/
    └── api.test.ts
```

### Example Test

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type checking
npm run type-check

# Build for production
npm run build
```

### Adding New Components

1. **Create component file** in `components/`
2. **Add TypeScript types** for props
3. **Write tests** in `__tests__/`
4. **Export from index** if needed
5. **Update documentation**

### Adding New Pages

1. **Create page file** in `app/`
2. **Add route metadata** (title, description)
3. **Implement page logic**
4. **Add navigation links**
5. **Test responsiveness**

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all variables from `.env.local`
3. **Build Settings**: Vercel auto-detects Next.js configuration
4. **Deploy**: Automatic deployment on every push to main branch

### Manual Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build
npm run build && npm run start
```

### Environment-Specific Configuration

```javascript
// next.config.mjs
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['your-domain.com'],
  },
  experimental: {
    appDir: true,
  },
}
```

## 📊 Performance Optimization

### Next.js Optimizations

- **Image Optimization**: Use `next/image` for automatic optimization
- **Code Splitting**: Automatic code splitting with dynamic imports
- **Static Generation**: Use `generateStaticParams` for static pages
- **Bundle Analysis**: Use `@next/bundle-analyzer` to analyze bundle size

### React Optimizations

- **Memoization**: Use `React.memo` for expensive components
- **useMemo/useCallback**: Optimize expensive calculations
- **Lazy Loading**: Use `React.lazy` for code splitting
- **Virtual Scrolling**: For large lists, use virtualization

### Example Optimizations

```tsx
// Optimized component with memoization
const ExpensiveChart = React.memo(({ data }: { data: ChartData[] }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }))
  }, [data])
  
  return <LineChart data={processedData} />
})

// Lazy loading
const LazyDashboard = React.lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyDashboard />
    </Suspense>
  )
}
```

## 🔒 Security Best Practices

- **Environment Variables**: Never expose sensitive data in client-side code
- **Input Validation**: Validate all user inputs with Zod schemas
- **Authentication**: Always verify JWT tokens
- **CORS**: Configure proper CORS settings
- **Content Security Policy**: Implement CSP headers
- **Dependencies**: Keep dependencies updated

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

3. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure proper CORS configuration

4. **Styling Issues**
   ```bash
   # Regenerate Tailwind CSS
   npx tailwindcss -i ./styles/globals.css -o ./styles/output.css
   ```

### Debug Mode

```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG=true npm run dev

# Run with verbose output
npm run dev -- --verbose
```

## 📈 Analytics & Monitoring

### Vercel Analytics

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Custom Analytics

```tsx
// lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Send to analytics service
    console.log('Event:', event, properties)
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow React best practices
- Write tests for new components
- Use semantic commit messages
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🌐 Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Supabase Documentation**: https://supabase.com/docs
- **Recharts Documentation**: https://recharts.org

---

⭐ **Star this repository** if you found it helpful!
