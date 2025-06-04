// components/layout/Layout.tsx
import Footer from "../Footer";
import Header from "../Header";

export default function Layout({ children ,user}: { children: React.ReactNode ,user?:any}) {
  return (
    <div >
      <Header user={user}/> 
      <main >{children}
        
      </main>
      <Footer />
    </div>
  );
} 
   