type MenuOption = { name: string; content: string };

type Props = {
  current: string;
  onChange: (page: string) => void;
  menuOptions: MenuOption[];
};

export default function SidebarMenu({ current, onChange, menuOptions }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">JobLink</h2>
      <nav className="flex flex-col gap-1">
        {menuOptions.map((opt) => (
          <button
            key={opt.name}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              current === opt.name
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-slate-700"
            }`}
            onClick={() => onChange(opt.name)}
          >
            {opt.content}
          </button>
        ))}
      </nav>
    </div>
  );
}
