import { widgets, WIDGET_SIZE_CLASS } from "@/config/widgets";
import WidgetShell from "./components/widgets/WidgetShell";

export default function Home() {
  return (
    <>
      {widgets.map((widget) => {
        const Component = widget.component;
        return (
          <div
            key={widget.id}
            className={WIDGET_SIZE_CLASS[widget.size]}
            data-widget-id={widget.id}
          >
            <WidgetShell
              title={widget.title}
              category={widget.category}
              size={widget.size}
            >
              <Component />
            </WidgetShell>
          </div>
        );
      })}
    </>
  );
}
