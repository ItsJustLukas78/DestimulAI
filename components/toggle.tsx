
interface ToggleProps {
  title: string
  checked: boolean
  changeValue: (value: boolean) => void
}

function Toggle({title, checked, changeValue}: ToggleProps) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(event => changeValue(event.target.checked))} className="sr-only peer"></input>
        <div className="relative w-9 h-5 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
        </div>
        <span className="ms-3 text-xs font-medium">{title}</span>
    </label>
  )
}

export default Toggle
