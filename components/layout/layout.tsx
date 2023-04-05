import { FC, PropsWithChildren } from "react"

const Layout:FC<PropsWithChildren>=(props)=>{
    return (
        <div
            className="lg:py-16 bg-secondary2 w-screen lg:h-screen flex 
                        flex-col justify-center items-center text-secondary1 dark:text-primary1 lg:px-24"
        >
            <main
                className="grid grid-cols-[minmax(min-content,500px)] pt-28 lg:pt-2
                            lg:grid-cols-[72px_minmax(min-content,500px)_1fr] w-full h-full gap-2 z-10 justify-center"
            >
                {props.children}
            </main>
            <footer className="lg:absolute lg:bottom-4 text-primary1">
                Copyright &copy; {new Date().getFullYear()} - Hitesh Modi
            </footer>
        </div>
    );
}
export default Layout