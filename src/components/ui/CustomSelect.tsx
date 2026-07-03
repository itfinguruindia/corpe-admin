import { Description, Label, ListBox, Select } from "@heroui/react";

interface CustomSelectProps {
  value?: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  /** Accessible name (required by HeroUI when no visible label is shown). */
  ariaLabel: string;
  label?: string;
  renderValue?: (value: string) => React.ReactNode;
  isDisabled?: boolean;
  className?: string;
}

function resolveSelectOptionId(
  raw: unknown,
  options: { id: string; label: string }[],
): string {
  if (raw == null) return "";
  const value = typeof raw === "string" ? raw.trim() : String(raw).trim();
  if (!value) return "";

  const byId = options.find((option) => option.id === value);
  if (byId) return byId.id;

  const byLabel = options.find(
    (option) => option.label.toLowerCase() === value.toLowerCase(),
  );
  return byLabel?.id ?? value;
}

const CustomSelect = (props: CustomSelectProps) => {
  const {
    options,
    label,
    ariaLabel,
    value,
    onChange,
    renderValue,
    isDisabled,
    className,
  } = props;
  return (
    <Select
      className={className ?? "min-w-32 w-full"}
      value={value}
      onChange={(value) => {
        onChange(resolveSelectOptionId(value, options));
      }}
      aria-label={ariaLabel}
      isDisabled={isDisabled}
    >
      {label ? (
        <Label className="mb-2 block text-sm font-medium text-gray-800">
          {label}
        </Label>
      ) : (
        <Label className="sr-only">{ariaLabel}</Label>
      )}
      <Select.Trigger className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm">
        {renderValue && value ? renderValue(value) : <Select.Value />}
        <Select.Indicator />
      </Select.Trigger>
      <Description />
      <Select.Popover className="rounded-lg text-black focus:outline-none">
        <ListBox>
          {options.map(({ id, label }) => (
            <ListBox.Item key={id} id={id} textValue={label}>
              {label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

export default CustomSelect;
