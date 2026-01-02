import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: 'default' | 'outline';
  children: React.ReactNode;
}

export function Button({ className, variant = 'default', children, ...props }: ButtonProps) {
  const baseStyle = "h-12 px-4 py-2 rounded-md flex-row items-center justify-center";
  const variants = {
    default: "bg-indigo-600",
    outline: "border border-gray-300 bg-white",
  };
  const textVariants = {
    default: "text-white font-medium",
    outline: "text-gray-700 font-medium",
  };

  return (
    <TouchableOpacity 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      activeOpacity={0.8}
      {...props}
    >
      <Text className={`${textVariants[variant]}`}>{children}</Text>
    </TouchableOpacity>
  );
}