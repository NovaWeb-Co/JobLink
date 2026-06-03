import { useState, useEffect } from "react";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/layout/Navbar";
import AuthModal from "./components/ui/AuthModal";

import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import MyProfilePage from "./pages/MyProfilePage";
import AdminPage from "./pages/AdminPage";
import RootDashboardPage from "./pages/RootPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Page =
  | { name: "home" }
  | { name: "services"; category?: string }
  | { name: "service-detail"; id: number }
  | { name: "provider"; id: number }
  | { name: "profile"; openPublish?: boolean }
  | { name: "admin" }
  | { name: "root" };

function AppInner() {
  const { showLoginModal, user, logout } = useAuth();

  const [page, setPage] = useState<Page>({
    name: "home",
  });

  useEffect(() => {
    if (!user) return;

    if (user.role === "ROOT") {
      setPage({ name: "root" });
    } else if (user.role === "ADMIN") {
      setPage({ name: "admin" });
    } else {
      setPage({ name: "profile" });
    }
  }, [user]);

  function handleLogout() {
    logout();
    setPage({ name: "home" });
  }

  function navPage(
    p: "home" | "services" | "profile" | "admin" | "root"
  ) {
    if (p === "home") {
      setPage({ name: "home" });
    } else if (p === "services") {
      setPage({ name: "services" });
    } else if (p === "profile") {
      setPage({ name: "profile" });
    } else if (p === "admin") {
      setPage({ name: "admin" });
    } else if (p === "root") {
      setPage({ name: "root" });
    }
  }

  function goToPublish() {
    setPage({
      name: "profile",
      openPublish: true,
    });
  }

  const currentNav =
    page.name === "home"
      ? "home"
      : page.name === "services" ||
        page.name === "service-detail"
        ? "services"
        : page.name === "profile"
          ? "profile"
          : page.name === "admin"
            ? "admin"
            : page.name === "root"
              ? "root"
              : "home";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--slate-light)",
      }}
    >
      <Navbar
        page={currentNav as any}
        setPage={navPage}
        onLogout={handleLogout}
      />

      {showLoginModal && <AuthModal />}

      {page.name === "home" && (
        <HomePage
          onGoToServices={(cat) =>
            setPage({
              name: "services",
              category: cat,
            })
          }
          onServiceClick={(id) =>
            setPage({
              name: "service-detail",
              id,
            })
          }
          onGoToPublish={() => goToPublish()}
        />
      )}

      {page.name === "services" && (
        <ServicesPage
          initialCategory={page.category}
          onServiceClick={(id) =>
            setPage({
              name: "service-detail",
              id,
            })
          }
        />
      )}

      {page.name === "service-detail" && (
        <ServiceDetailPage
          serviceId={page.id}
          onBack={() =>
            setPage({
              name: "services",
            })
          }
          onProviderClick={(id) =>
            setPage({
              name: "provider",
              id,
            })
          }
        />
      )}

      {page.name === "provider" && (
        <ProviderProfilePage
          userId={page.id}
          onBack={() => history.back()}
          onServiceClick={(id) =>
            setPage({
              name: "service-detail",
              id,
            })
          }
        />
      )}

      {/* USER */}
      {page.name === "profile" &&
        user &&
        user.role !== "ROOT" && (
          <MyProfilePage
            openPublish={page.openPublish}
          />
        )}

      {/* ADMIN */}
      {page.name === "admin" &&
        user &&
        user.role === "ADMIN" && (
          <AdminPage />
        )}

      {/* ROOT */}
      {page.name === "root" &&
        user &&
        user.role === "ROOT" && (
          <RootDashboardPage />
        )}

      <footer
        style={{
          background: "var(--navy)",
          marginTop: "4rem",
          padding: "2rem 0",
        }}
      >
        <div
          className="layout-main"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--gold)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: "0.9rem",
                color: "var(--navy)",
              }}
            >
              JL
            </div>

            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 700,
                color: "white",
              }}
            >
              JobLink
            </span>
          </div>

          <p
            style={{
              color: "#475569",
              fontSize: "0.8rem",
              margin: 0,
            }}
          >
            © 2026 JobLink · Plataforma de
            servicios locales
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </QueryClientProvider>
  );
}