import { Callout, IconButton } from "@radix-ui/themes";
import { Cross1Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ErrorDisplayProps {
    message: string;
    onClose: () => void;
}

export const ErrorDisplay = ({ message, onClose }: ErrorDisplayProps) => {
    if (!message) return null;
    
    return (
        <Callout.Root color="red" role="alert" mt="4" style={{ position: 'relative', paddingRight: '40px' }}>
            <Callout.Icon>
                <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
                {message}
            </Callout.Text>
            <IconButton 
                variant="ghost" 
                size="1" 
                color="red"
                onClick={onClose}
                style={{ 
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)'
                }}
            >
                <Cross1Icon />
            </IconButton>
        </Callout.Root>
    );
};
