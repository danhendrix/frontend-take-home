import { TextField, Button, Flex } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";

interface SearchBarProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    buttonText: string;
    onButtonClick?: () => void;
}

export const SearchBar = ({ 
    placeholder, 
    value, 
    onChange, 
    buttonText,
    onButtonClick 
}: SearchBarProps) => {
    return (
        <Flex gap="2">
            <TextField.Root 
                style={{ flex: 1 }} 
                size="3" 
                placeholder={placeholder} 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
            >
                <TextField.Slot>
                    <MagnifyingGlassIcon height="16" width="16" />
                </TextField.Slot>
            </TextField.Root>
            <Button size="3" variant="solid" onClick={onButtonClick}>
                <PlusIcon />
                {buttonText}
            </Button>
        </Flex>
    );
};
