"use client"

import * as React from "react"
import { cn } from "./utils"

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

const CollapsibleContext = React.createContext<{
  open: boolean;
  toggle: () => void;
}>({
  open: false,
  toggle: () => {},
});

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open = false, onOpenChange, children, className, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open);
    
    const isControlled = onOpenChange !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    
    const toggle = React.useCallback(() => {
      if (isControlled) {
        onOpenChange?.(!isOpen);
      } else {
        setInternalOpen(!isOpen);
      }
    }, [isControlled, isOpen, onOpenChange]);

    const contextValue = React.useMemo(() => ({
      open: isOpen,
      toggle,
    }), [isOpen, toggle]);

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <div ref={ref} className={cn("", className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, asChild = false, disabled = false, onClick, ...props }, ref) => {
    const { toggle } = React.useContext(CollapsibleContext);
    
    const handleClick = () => {
      if (!disabled) {
        toggle();
        onClick?.();
      }
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        onClick: handleClick,
        disabled,
        ref,
      });
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled}
        className={cn("", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    const { open } = React.useContext(CollapsibleContext);
    
    if (asChild && React.isValidElement(children)) {
      return open ? React.cloneElement(children, {
        ...children.props,
        ref,
      }) : null;
    }

    return open ? (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    ) : null;
  }
);
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent }