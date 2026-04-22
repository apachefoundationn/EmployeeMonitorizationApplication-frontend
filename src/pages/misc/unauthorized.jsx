import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Button } from '../../components/button.jsx'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Unauthorized</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          You do not have access to this page.
        </div>
        <div className="mt-4">
          <Link to="/">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

