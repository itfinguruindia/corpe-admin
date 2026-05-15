import { Description, Label, ListBox, Select } from "@heroui/react";

interface CustomSelectProps {
  value?: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
  /** Accessible name (required by HeroUI when no visible label is shown). */
  ariaLabel: string;
  label?: string;
  renderValue?: (value: string) => React.ReactNode;
}

const CustomSelect = (props: CustomSelectProps) => {
  const { options, label, ariaLabel, value, onChange, renderValue } = props;
  return (
    <Select
      className="min-w-32 w-full"
      value={value}
      onChange={(value) => onChange(value as string)}
      aria-label={ariaLabel}
    >
      {label ? (
        <Label>{label}</Label>
      ) : (
        <Label className="sr-only">{ariaLabel}</Label>
      )}
      <Select.Trigger>
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
