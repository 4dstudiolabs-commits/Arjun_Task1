import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './theme/ThemeProvider';
import { ToastProvider } from './components/common/ToastProvider';

import Sidebar from './components/layout/Sidebar';

// Pages
import WeatherUploadPage from './pages/Weather/WeatherUploadPage';
import MeterUploadPage from './pages/Meter/MeterUploadPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-300">
            <div className="flex min-h-screen">
              <Sidebar />

              <main className="flex-1 p-6 overflow-auto">
                <Routes>
                  <Route path="/" element={<Navigate to="/weather/upload" replace />} />

                  {/* Weather */}
                  <Route path="/weather/upload" element={<WeatherUploadPage />} />

                  {/* Meter */}
                  <Route path="/meter/upload" element={<MeterUploadPage />} />

                  {/* Fallback */}
                  <Route
                    path="*"
                    element={
                      <div className="surface p-6">
                        <h2 className="mb-2">Page not found</h2>
                        <p>The page you are trying to access does not exist.</p>
                      </div>
                    }
                  />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
