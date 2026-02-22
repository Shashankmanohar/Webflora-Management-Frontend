interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-background/40 backdrop-blur-xl border-b border-white/5 mx-[-1.5rem] lg:mx-[-2rem] px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
              <span className="w-1 h-3 rounded-full bg-primary/40" />
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
