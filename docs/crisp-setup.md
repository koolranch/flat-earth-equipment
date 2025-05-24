# Crisp Chat Widget Setup

## Installation

The Crisp chat widget is already integrated into the application. To activate it:

1. **Get your Crisp Website ID**
   - Log into your Crisp account at https://app.crisp.chat
   - Go to Settings → Website Settings
   - Copy your Website ID

2. **Add to Environment Variables**
   Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_CRISP_WEBSITE_ID=your_crisp_website_id_here
   ```

3. **Deploy**
   - For Vercel: Add the environment variable in your project settings
   - The chat widget will automatically load on all pages

## Features

- Edge-safe implementation using client-side component
- Loads after page hydration for optimal performance
- Automatically available on all pages
- TypeScript support included

## Customization

To customize the widget behavior, you can modify `components/CrispChat.tsx` and use the Crisp JavaScript API.

Example:
```javascript
window.$crisp.push(["set", "user:email", userEmail]);
```

Refer to [Crisp documentation](https://docs.crisp.chat/guides/chatbox-sdks/web-sdk/) for more customization options. 