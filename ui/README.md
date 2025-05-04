# Medical Booking Platform UI

This is the frontend for the AI-powered medical booking platform. The UI is built with Next.js 14, React 18, and Supabase for authentication.

## Features

- **Public Booking Widget**: Allows patients to find available slots and book appointments
- **Admin Console**: Calendar view for managing appointments
- **Authentication**: Secure login and authentication via Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd ui
npm install
# or
pnpm install
```

3. Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building the Widget

To build the standalone booking widget:

```bash
npm run build:widget
# or
pnpm build:widget
```

This will create a `dist/widget.es.js` file that can be embedded in any website with:

```html
<script type="module">
  import BookingWidget from 'https://your-domain.com/widget.es.js';

  // Use the widget
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('booking-widget');
    if (root) {
      // Render the widget with React
      ReactDOM.render(
        React.createElement(BookingWidget, { 
          clinic_id: "your-clinic-id",
          doctor_id: "your-doctor-id" 
        }),
        root
      );
    }
  });
</script>

<div id="booking-widget"></div>
```

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions
- `/src/styles` - Global styles
- `/src/widget` - Standalone widget entry point

## License

All rights reserved. 