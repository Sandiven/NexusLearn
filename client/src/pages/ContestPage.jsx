// Redirect shim — real implementation lives in features/
import { Navigate } from 'react-router-dom'
export default function ContestPage() { return <Navigate to="/contests" replace /> }
