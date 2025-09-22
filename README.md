# Domens - Invoice Management System for Ghana

A complete invoice management web application built specifically for Ghanaian small businesses. Create professional invoices, accept Mobile Money payments via Paystack, and automatically generate receipts.

## Features

### 🚀 Core Functionality
- **User Authentication**: Secure email/password authentication with Supabase
- **Invoice Creation**: Dynamic invoice builder with real-time calculations
- **Payment Integration**: Paystack integration with Mobile Money support
- **PDF Generation**: Professional invoice and receipt PDFs
- **Real-time Updates**: Live invoice status updates
- **WhatsApp Integration**: Share payment links directly via WhatsApp

### 💼 Business Features
- **Dashboard Analytics**: Revenue tracking, payment status overview
- **Ghana Phone Validation**: Proper validation for Ghana phone numbers
- **GHS Currency Support**: Ghana Cedis formatting throughout
- **Mobile Responsive**: Works perfectly on phones and tablets
- **Professional Templates**: Clean, business-ready invoice designs

### 🔧 Technical Features
- **React 18** with functional components and hooks
- **TailwindCSS** for responsive design
- **Supabase** for database and authentication
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates
- **Paystack API** for payment processing

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Paystack account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd domens-invoice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
   VITE_PAYSTACK_SECRET_KEY=sk_test_your_secret_key
   ```

4. **Set up Supabase Database**
   
   Click "Connect to Supabase" in the top right and follow the setup wizard. Then run the migration:
   
   In your Supabase dashboard, go to SQL Editor and run the migration file:
   `supabase/migrations/create_initial_schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Setup

### Supabase Configuration

1. **Create a new Supabase project**
2. **Enable email authentication** (disable email confirmation for testing)
3. **Run the database migration** from `supabase/migrations/create_initial_schema.sql`
4. **Copy your project URL and anon key** to the `.env` file

### Paystack Setup

1. **Create a Paystack account** at https://paystack.com
2. **Get your API keys** from the Developers section
3. **Use test keys** for development (they start with `pk_test_` and `sk_test_`)
4. **Enable Mobile Money** in your Paystack dashboard

## User Flow

1. **Sign Up**: Business owner creates account with business details
2. **Create Invoice**: Add customer details, items, quantities, and rates
3. **Generate Payment Link**: System creates Paystack payment link with Mobile Money options
4. **Share via WhatsApp**: Direct integration to share payment link with customer
5. **Payment Processing**: Customer pays via Mobile Money, card, or bank transfer
6. **Automatic Updates**: Invoice status updates automatically, receipt generated
7. **Download PDFs**: Both invoices and receipts available as professional PDFs

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard and analytics
│   ├── invoices/        # Invoice management
│   └── layout/          # App layout components
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── config/              # Configuration files
└── styles/              # CSS and styling
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout

### Invoices
- `GET /invoices` - List user invoices
- `POST /invoices` - Create new invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice

### Payments
- `POST /payments/initialize` - Create Paystack payment
- `GET /payments/verify/:reference` - Verify payment status

## Testing

### Test Data
- Use Paystack test cards for payment testing
- Ghana test Mobile Money numbers: Use any valid format
- Test phone numbers: 0244123456, +233501234567

### Payment Testing
1. Create an invoice
2. Generate payment link
3. Use test payment methods:
   - **Card**: 4084084084084081 (Visa)
   - **Mobile Money**: Any valid Ghana number
   - **Bank**: Test bank accounts provided by Paystack

## Environment Variables

```bash
# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Paystack (Payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
VITE_PAYSTACK_SECRET_KEY=sk_test_your_secret_key
```

## Deployment

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service
3. Set environment variables in your hosting platform

### Database
- Supabase handles database hosting automatically
- Ensure RLS policies are properly configured
- Set up production environment variables

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication Required**: All routes protected except login/signup
- **Input Validation**: Phone numbers, email, and payment amounts validated
- **HTTPS Only**: All API calls use secure connections
- **Environment Variables**: Sensitive keys stored securely

## Ghana-Specific Features

- **Phone Validation**: Supports all Ghana mobile networks (MTN, Vodafone, AirtelTigo)
- **Currency**: Ghana Cedis (GHS) formatting and calculations
- **Mobile Money**: Full support for all Ghana Mobile Money providers
- **WhatsApp Integration**: Direct sharing with Ghana phone number format

## Support

For issues and questions:
1. Check the GitHub Issues page
2. Review the Supabase and Paystack documentation
3. Test with sandbox/development keys first

## License

This project is licensed under the MIT License.