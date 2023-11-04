import { Link } from "react-router-dom";


const Register = () => {
     return (
       <div className="hero min-h-screen bg-base-200">
         <div className="hero-content w-full  ">
           <div className="card  w-full max-w-sm shadow-2xl bg-base-100">
             <h1 className="text-4xl playfair font-bold text-center my-4">
               Register now!
             </h1>

             <form className="card-body">
               <div className="form-control">
                 <label className="label">
                   <span className="label-text">Name</span>
                 </label>
                 <input
                   type="text"
                   placeholder="name"
                   name="name"
                   className="input input-bordered"
                   required
                 />
               </div>
               <div className="form-control">
                 <label className="label">
                   <span className="label-text">Photo Url</span>
                 </label>
                 <input
                   type="text"
                   placeholder="photo url"
                   className="input input-bordered"
                   name="photo"
                   required
                 />
               </div>
               <div className="form-control">
                 <label className="label">
                   <span className="label-text">Email</span>
                 </label>
                 <input
                   type="email"
                   placeholder="email"
                   className="input input-bordered"
                   required
                 />
               </div>
               <div className="form-control">
                 <label className="label">
                   <span className="label-text">Password</span>
                 </label>
                 <input
                   type="password"
                   placeholder="password"
                   className="input input-bordered"
                   required
                 />
               </div>
               <div className="form-control mt-6">
                 <button className="btn btn-primary">Login</button>
               </div>
             </form>
             <p className="px-4  py-4">
               {" "}
               Already Have an account ?{" "}
               <Link className="link link-primary" to={"/login"}>
                 {" "}
                 log in
               </Link>
             </p>
           </div>
         </div>
       </div>
     );
};

export default Register;