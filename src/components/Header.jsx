import axios from "axios";
import Link from "next/link";

export default function Header({ user }) {
    const handleLogout = async () => {
        let logout = await axios.post('/api/check-user', { action: "logout" })
        console.log("Logout", logout);
        if (logout.data.status) {
            window.location.href = "/"
        }
    }

    return (
        <header className="bg-orange-500 border-b border-orange-600 shadow-sm fixed top-0 w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-white hover:text-orange-100 transition-colors">
                            Blog
                        </h1>
                    </Link>
                    
                    {/* Navigation */}
                    <nav className="flex items-center space-x-4">
                        {/* My Blogs */}
                        <Link href="/my-blogs">
                            <button className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-orange-500">
                                My Blogs
                            </button>
                        </Link>

                        {/* User Section */}
                        {user && user.Name ? (
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center bg-orange-600 rounded-md px-3 py-2">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm mr-3">
                                        {user.Name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white font-medium mr-3">
                                        {user.Name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-orange-200 hover:text-red-600 transition-all duration-500 ease-in-out transform font-medium cursor-pointer hover:border-2 hover:bg-white hover:rounded-xl px-2 focus:outline-none"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/auth/login">
                                    <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-orange-500 font-medium px-4 py-2 rounded-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500">
                                        Login
                                    </button>
                                </Link>
                                <Link href="/auth/register">
                                    <button className="bg-white text-orange-500 hover:bg-orange-50 font-medium px-4 py-2 rounded-3xl transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}