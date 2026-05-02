import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/theme-context';
import { AuthProvider } from './context/auth-context';
import { CampusProvider } from './context/campus-context';
import { UpdatePrompt } from './components/update-prompt';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CampusProvider>
          <RouterProvider router={router} />
          <UpdatePrompt />
        </CampusProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
