import { cn } from '../utils/cn.js'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/80', className)} />
}
 
