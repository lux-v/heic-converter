import React, { useCallback, useState } from 'react';

import heic2any from 'heic2any';
import './HeicToPngConverter.css';
import JSZip from 'jszip';
import { useDropzone } from 'react-dropzone';
import classnames from 'classnames';
import { Triangle } from 'react-loader-spinner';

function HeicToPngConverter() {
	const [inputImageFiles, setInputImageFiles] = useState([]);
	const [outputImageFiles, setOutputImageFiles] = useState([]);
	const [isConverting, setIsConverting] = useState(false);
	const [error, setError] = useState(null);
	const [numFiles, setNumFiles] = useState(0); // new state variable

	const onDrop = useCallback((acceptedFiles) => {
		setInputImageFiles([...acceptedFiles]);
		setOutputImageFiles([]);
		setError(null);
		setNumFiles(acceptedFiles.length);
	}, []);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		onDrop,
	});

	async function handleFormSubmit(event) {
		event.preventDefault();

		setIsConverting(true);

		if (inputImageFiles.length === 0) {
			setError('Please select at least one file.');
			setIsConverting(false);
			return;
		} else {
			setError(null);
		}

		const convertedFiles = [];
		const errors = [];
		for (let i = 0; i < inputImageFiles.length; i++) {
			const inputFile = inputImageFiles[i];
			try {
				const outputImageBlob = await heic2any({
					blob: inputFile,
					toType: 'image/png',
				});

				const outputImageFile = new File(
					[outputImageBlob],
					inputFile.name
						.replace('.heic', '.png')
						.replace('.HEIC', '.png'),
					{
						type: 'image/png',
					}
				);
				convertedFiles.push(outputImageFile);
			} catch (error) {
				errors.push(inputFile.name);
				console.error(
					`An error occurred with file '${inputFile.name}':`,
					error
				);
			}
		}

		setOutputImageFiles(convertedFiles);
		setIsConverting(false);

		if (errors.length > 0) {
			setError(
				`Errors occurred while converting the following files: ${errors.join(
					', '
				)}`
			);
		}
	}

	async function handleDownloadAll() {
		if (outputImageFiles.length === 0) {
			setError('Please convert at least one file.');
			return;
		} else {
			setError(null);
		}

		// Create a zip file and add all converted files to it
		const zip = new JSZip();
		outputImageFiles.forEach((file) => {
			zip.file(file.name, file);
		});

		// Generate the zip file and create a download link
		const zipBlob = await zip.generateAsync({ type: 'blob' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(zipBlob);
		link.download = 'converted_images.zip';
		link.click();
	}

	const handleInputChange = useCallback((event) => {
		const files = event.target.files;
		setInputImageFiles([...files]);
		setOutputImageFiles([]);
		setError(null);
		setNumFiles(files.length);
	}, []);

	const handleFileremove = useCallback(() => {
		setInputImageFiles([]);
		setOutputImageFiles([]);
		setError(null);
		setNumFiles(0);
	}, []);

	return (
		<div className='container'>
			<h1 className='title'>HEIC to PNG Converter</h1>
			<div
				className={classnames('dropzone', {
					accept: isDragAccept,
					reject: isDragReject,
					hover: isDragActive,
				})}
				accept='.HEIC' // Add the accept attribute with the file types
				{...getRootProps()}
			>
				<input {...getInputProps()} />
				{isDragActive ? (
					<p>Drop the files here ...</p>
				) : (
					<p>
						Drag 'n' drop some files here, or click to select files
					</p>
				)}
			</div>
			<form onSubmit={handleFormSubmit} className='form'>
				{numFiles > 0 && (
					<div style={{ display: 'flex', padding: '10px' }}>
						<label className='selected-label'>
							{numFiles} files selected
						</label>
						<button
							type='button'
							onClick={handleFileremove}
							className={classnames('remove-button', {
								disabled: isConverting,
							})}
							disabled={isConverting}
						>
							Remove
						</button>
					</div>
				)}

				<button
					type='submit'
					className={classnames('submit-button', {
						disabled: isConverting,
					})}
					disabled={isConverting}
					style={{ display: inputImageFiles.length === 0 && 'none' }}
				>
					Convert
				</button>
			</form>
			<button
				className='submit-button'
				onClick={handleDownloadAll}
				style={{ display: outputImageFiles.length <= 1 && 'none' }}
			>
				Download all
			</button>
			{error && <p className='error-message'>{error}</p>}
			{isConverting && (
				<Triangle
					height='80'
					width='80'
					color='#007bff'
					ariaLabel='triangle-loading'
					wrapperStyle={{}}
					wrapperClassName=''
					visible={true}
				/>
			)}
			{outputImageFiles.length > 0 && (
				<div className='output-container'>
					<p className='output-message'>Conversion complete:</p>
					{outputImageFiles.map((outputImageFile, index) => (
						<div key={index} className='output-image-container'>
							<img
								src={URL.createObjectURL(outputImageFile)}
								alt={`Output ${index}`}
								className='output-image'
							/>
							<label className='output-image-label'>
								{outputImageFile.name}
							</label>
							<a
								href={URL.createObjectURL(outputImageFile)}
								download={outputImageFile.name}
								type='image/png'
								className='download-link'
							>
								Download PNG
							</a>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default HeicToPngConverter;
