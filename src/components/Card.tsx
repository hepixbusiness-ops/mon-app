export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1c1c1e] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  )
}
