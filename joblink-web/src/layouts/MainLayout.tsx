import React from "react";

export default function MainLayout({
  sidebar,
  content,
}: {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r p-4 flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {content}
      </main>
    </div>
  );
}
