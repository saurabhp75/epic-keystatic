// app/routes/posts.$slug.tsx
import { createReader } from '@keystatic/core/reader'
import Markdoc from '@markdoc/markdoc'
import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import React from 'react'

import keystaticConfig from '../../../keystatic.config'

export async function loader({ params }: LoaderFunctionArgs) {
	const reader = createReader(process.cwd(), keystaticConfig)
	const slug = params.slug
	if (!slug) throw json('Not Found', { status: 404 })
	const post = await reader.collections.posts.read(
		slug,
		// Retrieve the content data directly, instead
		// of getting an async `content()` function
		{ resolveLinkedFiles: true },
	)
	if (!post) throw json('Not Found', { status: 404 })
	// const errors = Markdoc.validate(post.content.node, markdocConfig)
	const errors = Markdoc.validate(post.content.node)
	if (errors.length) {
		console.error(errors)
		throw new Error('Invalid content')
	}
	// const content = Markdoc.transform(post.content.node, markdocConfig)
	const content = Markdoc.transform(post.content.node)
	return json({
		post: {
			title: post.title,
			content,
		},
	})
}

export default function Post() {
	const { post } = useLoaderData<typeof loader>()
	return (
		<>
			<h1>{post.title}</h1>
			{Markdoc.renderers.react(post.content, React)}
		</>
	)
}
