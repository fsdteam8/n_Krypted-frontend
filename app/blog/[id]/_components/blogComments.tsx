import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface BlogCommentsProps {
    blogId: string;
}

function BlogComments({ blogId }: BlogCommentsProps) {
    const [saveInfo, setSaveInfo] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [message, setMessage] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user?.name || '',
                email: session.user?.email || ''
            }));
        } else {
            const saved = localStorage.getItem('blogCommentInfo');
            if (saved) {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({
                    ...prev,
                    name: parsed.name || '',
                    email: parsed.email || ''
                }));
            }
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure your API endpoint is correct - typically it would be /api/comments without the extra 'm'
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user?.accessToken || ''}`
                },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    message: formData.message,  // Changed from 'message' to 'content' to match common conventions
                    blogId: blogId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

          

            setMessage('Comment submitted successfully!');
            setFormData(prev => ({ ...prev, message: '' }));
            
            if (!saveInfo && !session?.user) {
                localStorage.removeItem('blogCommentInfo');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            setMessage(error instanceof Error ? error.message : 'Something went wrong.');
        }
    };

    useEffect(() => {
        if (saveInfo && !session?.user) {
            localStorage.setItem('blogCommentInfo', JSON.stringify({
                name: formData.name,
                email: formData.email
            }));
        }
    }, [formData.name, formData.email, saveInfo, session]);

    return (
        <div className="">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Leave a comment</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!session?.user && (
                    <>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded" 
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </>
                )}
                <textarea
                    name="message"
                    placeholder="Your comment"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded h-32"
                />
                {!session?.user && (
                    <div className="flex items-center space-x-2 text-white">
                        <input
                            type="checkbox"
                            id="saveInfo"
                            name="saveInfo"
                            checked={saveInfo}
                            onChange={() => setSaveInfo(prev => !prev)}
                            className="mt-1"
                        />
                        <label htmlFor="saveInfo" className='mt-[3px]'>
                            Save my name and email in this browser for the next time I comment.
                        </label>
                    </div>
                )}
                <div>
                    <button type="submit" className="bg-white text-black px-8 py-2 rounded">
                        Submit
                    </button>
                </div>
                {message && <p className={`mt-2 text-sm ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </p>}
            </form>
        </div>
    );
}

export default BlogComments;