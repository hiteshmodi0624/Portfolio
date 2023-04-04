import { FC, PropsWithChildren } from "react"

const Layout:FC<PropsWithChildren>=(props)=>{
    return <div className="py-16 bg-secondary2 w-screen lg:h-screen flex justify-center items-center text-primary1 px-24">
        <main className="grid grid-cols-[minmax(min-content,500px)] lg:grid-cols-[72px_minmax(min-content,500px)_1fr] w-full h-full gap-2 z-10 justify-center">
            {props.children}
        </main>
    </div>
}
export default Layout