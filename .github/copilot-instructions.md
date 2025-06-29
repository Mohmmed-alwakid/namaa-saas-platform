# Full-Stack SaaS Template - Copilot Instructions

Use this file to provide workspace-specific custom instructions to GitHub Copilot. This helps Copilot understand your project structure and coding conventions for better assistance.

## 📋 Project Overview

This is a **Full-Stack SaaS Application Template** designed for rapid development of modern web applications. The template provides a complete foundation with authentication, database integration, and modern UI components.

**Status**: ✅ Production-ready template  
**Tech Stack**: React 19 + TypeScript + Vite + Supabase + Tailwind CSS  
**Architecture**: Full-stack with serverless backend

## 🛠️ Tech Stack & Architecture

### Frontend
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **React Router DOM** for routing
- **React Hook Form + Zod** for form handling and validation
- **Zustand** for state management
- **React Query** for server state management
- **Framer Motion** for animations

### Backend
- **Vercel Serverless Functions** (Express.js style)
- **Supabase** for database and authentication
- **CORS** enabled for cross-origin requests
- **Express middleware** patterns

### Database
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** capability
- **Authentication** handled by Supabase Auth## 📁 Project Structure

```
├── src/
│   ├── client/           # React frontend components
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components and routes
│   │   ├── hooks/        # Custom React hooks
│   │   ├── stores/       # Zustand stores for state management
│   │   └── utils/        # Frontend utility functions
│   ├── shared/           # Code shared between frontend/backend
│   │   ├── types/        # TypeScript type definitions
│   │   └── utils/        # Shared utility functions
│   └── server/           # Server-side code (optional)
├── api/                  # Vercel serverless functions
├── docs/                 # Documentation files
├── public/               # Static assets
└── local-*              # Local development servers
```

## 💻 Development Environment

### Local Development Commands
```bash
# Primary development (RECOMMENDED)
npm run dev:fullstack     # Starts both frontend and backend locally

# Individual services
npm run dev:client        # Frontend only (Vite dev server)
npm run dev:local         # Backend API only (Express server)
npm run dev              # Vercel dev (slower alternative)

# Build and test
npm run build            # Production build
npm run type-check       # TypeScript validation
npm run preview          # Preview production build
```

### Development URLs
- **Frontend**: http://localhost:5180
- **Backend API**: http://localhost:3005
- **Health Check**: http://localhost:3005/api/health

## 🎨 UI/UX Conventions

### Design System
- **Primary Colors**: Blue (#3B82F6) for primary actions
- **Secondary Colors**: Gray scale for neutral elements
- **Success**: Green (#22C55E) for positive actions
- **Warning**: Yellow (#F59E0B) for caution
- **Error**: Red (#EF4444) for errors and dangerous actions

### Component Patterns
```tsx
// Preferred component structure
interface ComponentProps {
  // Define all props with TypeScript
  title: string;
  onAction?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onAction, 
  variant = 'primary' 
}) => {
  return (
    <div className="component-base-styles">
      {/* Component implementation */}
    </div>
  );
};
```

### Styling Conventions
- Use **Tailwind CSS classes** for styling
- Follow **mobile-first** responsive design
- Use **semantic HTML** elements
- Implement **WCAG accessibility** standards
- Prefer **composition** over inheritance

## 🔧 Code Conventions

### TypeScript Standards
- Use **strict mode** TypeScript configuration
- Define **interfaces** for all data structures
- Use **type guards** for runtime validation
- Prefer **explicit types** over `any`
- Use **generic types** for reusable components

### React Patterns
```tsx
// Functional components with hooks
const useCustomHook = (dependency: string) => {
  const [state, setState] = useState<StateType>();
  
  useEffect(() => {
    // Effect logic
  }, [dependency]);
  
  return { state, setState };
};

// Form handling pattern
const FormComponent = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(validationSchema)
  });
  
  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### API Patterns
```typescript
// API endpoint structure
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Validate method
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    // Process request
    const result = await processRequest(req.body);
    
    // Return success response
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

### Database Patterns
- Use **parameterized queries** to prevent SQL injection
- Implement **Row Level Security** policies
- Use **TypeScript interfaces** for database entities
- Follow **RESTful conventions** for API endpoints

## 🔐 Security Guidelines

### Authentication
- Use **Supabase Auth** for user management
- Implement **JWT token** validation on protected routes
- Use **refresh tokens** for session management
- Validate **user roles** for authorization

### Data Protection
- Enable **Row Level Security** on all tables
- Validate **all user inputs** with Zod schemas
- Use **environment variables** for sensitive data
- Implement **CORS** properly for API access

## 🚀 Performance Best Practices

### Frontend Optimization
- Use **React.lazy** for code splitting
- Implement **React.memo** for expensive components
- Use **useMemo** and **useCallback** appropriately
- Optimize **images and assets**

### Backend Optimization
- Use **database indexes** for query performance
- Implement **API caching** where appropriate
- Use **connection pooling** for database connections
- Monitor **API response times**

## 📝 Documentation Standards

### Code Documentation
- Use **JSDoc comments** for complex functions
- Write **README files** for major features
- Document **API endpoints** with examples
- Include **TypeScript types** documentation

### Commit Conventions
```bash
# Use conventional commit format
feat: add new authentication flow
fix: resolve database connection issue  
docs: update API documentation
style: format code with prettier
refactor: improve component structure
test: add unit tests for auth service
```

## 🧪 Testing Guidelines

### Testing Strategy
- Write **unit tests** for utility functions
- Test **component behavior** with React Testing Library
- Test **API endpoints** with integration tests
- Use **TypeScript** for test files

### Testing Patterns
```typescript
// Component testing
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName {...props} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});

// API testing
describe('API Endpoint', () => {
  it('should return success response', async () => {
    const response = await request(app).post('/api/endpoint').send(testData);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## 🔄 Development Workflow

### Feature Development
1. **Create feature branch** from main
2. **Implement feature** with tests
3. **Update documentation** as needed
4. **Test locally** with `npm run dev:fullstack`
5. **Submit pull request** with description
6. **Deploy** after review and approval

### Code Review Guidelines
- Check **TypeScript types** are properly defined
- Verify **accessibility standards** are followed
- Ensure **security best practices** are implemented
- Confirm **performance optimizations** are applied
- Validate **test coverage** is adequate

---

**Use these guidelines when suggesting code improvements, generating new components, or helping with development tasks. This ensures consistency with the project's architecture and conventions.**