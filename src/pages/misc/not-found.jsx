import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Button } from '../../components/button.jsx'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600 dark:text-slate-300">The page you requested does not exist.</div>
          <div className="mt-4">
            <Link to="/">
              <Button>Back to app</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

