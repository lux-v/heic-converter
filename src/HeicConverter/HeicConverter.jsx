import React, { useCallback, useState } from 'react';

// 3rd party libraries
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import classnames from 'classnames';
import { Triangle } from 'react-loader-spinner';

import logo from '../assets/images/logo.png';
import { convertOptions } from '../assets/constants/constants.js';
import './HeicConverter.css';

function HeicConverter() {
	const [inputImageFiles, setInputImageFiles] = useState([]);
	const [outputImageFiles, setOutputImageFiles] = useState([]);
	const [isConverting, setIsConverting] = useState(false);
	const [error, setError] = useState(null);
	const [numFiles, setNumFiles] = useState(0); // new state variable

	const [conversionType, setConversionType] = useState('jpeg');

	const handleConversionTypeChange = (event) => {
		setConversionType(event.target.value);
	};

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
					toType: `image/${conversionType}`,
				});

				const outputImageFile = new File(
					[outputImageBlob],
					inputFile.name
						.replace('.heic', `.${conversionType}`)
						.replace('.HEIC', `.${conversionType}`),
					{
						type: `image/${conversionType}`,
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

	const handleFileRemove = useCallback(() => {
		setInputImageFiles([]);
		setOutputImageFiles([]);
		setError(null);
		setNumFiles(0);
	}, []);

	return (
		<div className='dropzone-container'>
			{/* <div
				className='logo'
				style={{
					position: 'absolute',
					left: '10px',
					top: '10px',
					width: '100px',
				}}
			>
				<img src={logo} alt='logo' style={{ width: '100%' }} />
			</div> */}
			<h1 className='title'>
				HEIC to&nbsp;
				<select
					value={conversionType}
					onChange={handleConversionTypeChange}
					disabled={isConverting}
				>
					{convertOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				&nbsp;Converter
			</h1>
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
						Drag 'n' drop .heic files here, or click to select them
					</p>
				)}
			</div>
			<form onSubmit={handleFormSubmit} className='form'>
				{numFiles > 0 && (
					<div
						style={{
							display: 'flex',
							padding: '10px',
							gap: '10px',
						}}
					>
						<label className='selected-label'>
							{numFiles === 1
								? `${numFiles} file selected`
								: `${numFiles} files selected`}
						</label>
						<button
							type='button'
							onClick={handleFileRemove}
							className={classnames('button remove', {
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
					className={classnames('button ', {
						disabled: isConverting,
					})}
					disabled={isConverting}
					style={{ display: inputImageFiles.length === 0 && 'none' }}
				>
					{isConverting
						? 'Converting...'
						: 'Convert to ' + conversionType.toUpperCase()}
				</button>
			</form>

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
				<>
					<p className='output-message'>Conversion complete:</p>
					<button
						className='button'
						onClick={handleDownloadAll}
						style={{
							display: outputImageFiles.length <= 1 && 'none',
						}}
					>
						Download all
					</button>
					<div className='output-container'>
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
									type={`image/${conversionType}`}
									className='button'
								>
									Download file
								</a>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}

export default HeicConverter;
