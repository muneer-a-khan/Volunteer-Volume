# Migration Helpers for ShadCN Components

This document provides patterns to follow when replacing old components with ShadCN components.

## Button

### Old Component Usage
```jsx
<button 
  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
  onClick={handleClick}
>
  Click Me
</button>

// Or with the component
<Button
  variant="primary" 
  onClick={handleClick}
>
  Click Me
</Button>
```

### ShadCN Usage
```jsx
import { Button } from "@/components/ui/button";

<Button 
  variant="default" // or "outline", "secondary", "ghost", "link", "destructive"
  onClick={handleClick}
>
  Click Me
</Button>
```

## Card

### Old Component Usage
```jsx
<div className="bg-white shadow-md rounded-lg p-6">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p>Card content goes here</p>
</div>

// Or with the component
<Card>
  <CardTitle>Card Title</CardTitle>
  <CardContent>Card content goes here</CardContent>
</Card>
```

### ShadCN Usage
```jsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Card footer content
  </CardFooter>
</Card>
```

## Alert

### Old Component Usage
```jsx
<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
  <p>Error message goes here</p>
</div>

// Or with the component
<Alert type="error" message="Error message goes here" />
```

### ShadCN Usage
```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";

// Error Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Error message goes here</AlertDescription>
</Alert>

// Success Alert
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertDescription>Success message goes here</AlertDescription>
</Alert>

// Info Alert
<Alert>
  <InfoIcon className="h-4 w-4" />
  <AlertDescription>Informational message goes here</AlertDescription>
</Alert>
```

## Input

### Old Usage
```jsx
<input 
  type="text"
  value={value}
  onChange={handleChange}
  className="border rounded px-3 py-2 w-full"
  placeholder="Enter your name"
/>
```

### ShadCN Usage
```jsx
import { Input } from "@/components/ui/input";

<Input
  type="text"
  value={value}
  onChange={handleChange}
  placeholder="Enter your name"
/>
```

## Select

### Old Usage
```jsx
<select
  value={selectedValue}
  onChange={handleSelectChange}
  className="border rounded px-3 py-2 w-full"
>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### ShadCN Usage
```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select
  value={selectedValue}
  onValueChange={handleSelectChange}
>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Form Fields

### Old Usage
```jsx
<div>
  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="border rounded px-3 py-2 w-full mt-1"
  />
  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
</div>
```

### ShadCN Usage with react-hook-form
```jsx
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const form = useForm();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Checkbox

### Old Usage
```jsx
<div className="flex items-center">
  <input
    type="checkbox"
    id="terms"
    checked={isChecked}
    onChange={handleChange}
    className="h-4 w-4 text-blue-500"
  />
  <label htmlFor="terms" className="ml-2 text-sm">I agree to the terms</label>
</div>
```

### ShadCN Usage
```jsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
  <Checkbox
    id="terms"
    checked={isChecked}
    onCheckedChange={handleChange}
  />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none"
  >
    I agree to the terms
  </label>
</div>
``` 