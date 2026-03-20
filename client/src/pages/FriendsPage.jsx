// Redirect shim — real implementation lives in features/
import { Navigate } from 'react-router-dom'
export default function FriendsPage() { return <Navigate to="/friends" replace /> }
