import {type ComponentProps, createContext, useContext, useState} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import useIsMobile from "@/hooks/use-is-mobile.ts";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";
import { m } from "@/paraglide/messages.js";


const SuggestionsContext = createContext<{
    setIsOpen: (isOpen: boolean) => void;
} | null>(null);

export type SuggestionsProps = ComponentProps<"div">;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => {
    const {isMobile} = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    return (
            <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
                {isMobile && (!isOpen ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setIsOpen(true)}
                    >
                        {m.chat_expand_suggestions()}
                        <ChevronUpIcon className="size-3" />
                    </Button>
                )
                : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setIsOpen(false)}
                        >
                            {m.chat_collapse_suggestions()}
                            <ChevronDownIcon className="size-3" />
                        </Button>
                    ))}
                {(!isMobile || (isMobile && isOpen)) && children}
            </div>
    )
}

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const context = useContext(SuggestionsContext);
  const handleClick = () => {
    onClick?.(suggestion);
    context?.setIsOpen(false);
  };

  return (
    <Button
      className={cn("h-auto cursor-pointer rounded-full px-3 py-1.5 text-center text-xs whitespace-normal", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
