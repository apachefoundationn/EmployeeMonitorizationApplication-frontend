import { cn } from '../utils/cn.js'

export function Card({ className, ...props }) {
  return <div className={cn('surface', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-slate-200 px-5 py-4 dark:border-slate-800', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <div className={cn('text-sm font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

