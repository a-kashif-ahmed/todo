export default function SystemHealthCard(){
    return (
        <div className="m-5 flex flex-col rounded-lg border border-default bg-surface-2 p-6 shadow-xs transition-colors hover:bg-surface-3">
            
                <h2 className="mb-1 text-xl font-semibold text-white">SYSTEM HEALTH</h2>
                <div className="flex">
                    <span className="text-brand-blue">99.8%</span>
                    <span className="text-gray-700 pl-2">uptime this month</span>
                </div>
                <div className="border-b-5 border-brand-blue">

                </div>
        </div>
    )
}