// Redirect shim — real implementation lives in features/
import { Navigate } from 'react-router-dom'
export default function FightPage() { return <Navigate to="/fight/new" replace /> }
