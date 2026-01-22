import {type ComponentProps, useState} from "react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import useIsMobile from "@/hooks/use-is-mobile.ts";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";
import {m} from "@/paraglide/messages.js";
import {AnimatePresence, motion} from "motion/react";


export type SuggestionsProps = ComponentProps<"div">;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => {
    const {isMobile, isLoading} = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);
    return ( isLoading ? null :
            <div className={cn("flex flex-wrap items-center justify-center gap-2", className)} {...props}>
                <AnimatePresence mode="wait">
                    {isMobile && (!isOpen ? (
                        <motion.div
                            key="expand"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => setIsOpen(true)}
                            >
                                {m.chat_expand_suggestions()}
                                <ChevronUpIcon className="size-3" />
                            </Button>
                        </motion.div>
                    )
                    : (
                            <motion.div
                                key="collapse"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {m.chat_collapse_suggestions()}
                                    <ChevronDownIcon className="size-3" />
                                </Button>
                            </motion.div>
                        ))}
                </AnimatePresence>

                <AnimatePresence>
                    {(!isMobile || (isMobile && isOpen)) && (
                        <motion.div
                            key="suggestions-list"
                            initial={isMobile ? { height: 0, opacity: 0 } : false}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className={cn("flex w-full flex-wrap items-center justify-center gap-2 overflow-hidden")}
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
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
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      className={cn("h-auto max-w-full cursor-pointer rounded-full px-3 py-1.5 text-center text-xs whitespace-normal break-words shrink", className)}
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
